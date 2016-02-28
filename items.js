/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


//var MongoClient = require('mongodb').MongoClient,
var assert = require('assert');


// @todo: rewrite as class and make a module
function ItemDAO(database) {
    'use strict';

    this.db = database;
    // @todo: implement collection variable

    this.getCategories = (callback) => {
        'use strict';

        var query = [
            { $group: {
                _id: '$category',
                num: { $sum: 1 }
            } },
            { $sort: { _id: 1 } }
        ];

        this.db.collection('item')
            .aggregate(query)
            .toArray((err, docs) => {
                assert.equal(err, null);

                var allCount = docs.reduce((prev, current, index, array) => index === 1 ? prev.num + current.num : prev + current.num);

                docs.unshift({
                    _id: 'All',
                    num: allCount
                });

                callback(docs);
            });
    };


    // page starts from 0
    this.getItems = (category, page, itemsPerPage, callback) => {
        'use strict';

        var query = category === 'All' ? {} : { category: category };
        var cursor = this.db.collection('item').find(query);

        // apply .skip() to the cursor if necessary, depending on the page
        if (this.isNotFirstPage(page)) {
            cursor.skip(this.paginate(page, itemsPerPage));
        }

        cursor.limit(itemsPerPage);

        cursor.toArray((err, docs) => {
            assert.equal(err, null);
            callback(docs);
        });
    };


    this.getNumItems = (category, callback) => {
        'use strict';

        var query = category === 'All' ? {} : { category: category };

        this.db.collection('item')
            .find(query)
            .count((err, count) => {
                assert.equal(err, null);
                callback(count);
            });
    };


    this.searchItems = (query, page, itemsPerPage, callback) => {
        'use strict';

        var searchQuery = { $text: { $search: query }};

        var cursor = this.db.collection('item').find(searchQuery);

        if (this.isNotFirstPage(page)) {
            cursor.skip(this.paginate(page, itemsPerPage));
        }

        cursor.limit(itemsPerPage);

        cursor.toArray((err, docs) => {
            assert.equal(err, null);
            callback(docs);
        });
    };


    this.getNumSearchItems = (query, callback) => {
        'use strict';

        this.db.collection('item')
            .find({ $text: { $search: query }})
            .count((err, count) => {
                assert.equal(err, null);
                callback(count);
            });
    };


    this.getItem = (itemId, callback) => {
        'use strict';

        this.db.collection('item')
            .find({ _id: itemId })
            .limit(1)
            .next((err, doc) => {
                assert.equal(err, null);
                callback(doc);
            });
    };


    this.getRelatedItems = function(callback) {
        'use strict';

        this.db.collection('item')
            .find({})
            .limit(4)
            .toArray((err, relatedItems) => {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addReview = (itemId, comment, name, stars, callback) => {
        'use strict';

        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        };

        this.db.collection('item')
            .updateOne(
                { _id: itemId },
                { "$push": { "reviews": reviewDoc } },
                { upsert: true, w: 1 },
                (err, result) => {
                    assert.equal(err, null);
                    callback(result);
                }
            );
    };

    // @todo: make it external (move out from a class)
    this.paginate = (page, itemsPerPage) => {
        if (page > 0 && page === 1) {
            return itemsPerPage;
        } else if (page > 1) {
            return page * itemsPerPage;
        }
    };

    // @todo: make it external (move out from a class)
    this.isNotFirstPage = (page) => {
        return page && page > 0;
    };
}


module.exports.ItemDAO = ItemDAO;
