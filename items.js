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


    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";
        
        /*
         * TODO-lab2A
         *
         * LAB #2A: Using the value of the query parameter passed to this method, perform
         * a text search against the item collection. Do not sort the results. Select only 
         * the items that should be displayed for a particular page. For example, on the 
         * first page, only the first itemsPerPage matching the query should be displayed. 
         * Use limit() and skip() and the method parameters: page and itemsPerPage to 
         * select the appropriate matching products. Pass these items to the callback 
         * function. 
         *
         * You will need to create a single text index on title, slogan, and description.
         *
         */
        
        //var item = this.createDummyItem();
        //var items = [];
        //for (var i=0; i<5; i++) {
        //    items.push(item);
        //}

        // TODO-lab2A Replace all code above (in this method).

        //callback(items);
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


    this.getNumSearchItems = function(query, callback) {
        "use strict";

        //var numItems = 0;
        
        /*
        * TODO-lab2B
        *
        * LAB #2B: Using the value of the query parameter passed to this method, count the
        * number of items in the "item" collection matching a text search. Pass the count
        * to the callback function.
        *
        */

        //callback(numItems);
        this.db.collection('item')
            .find({ $text: { $search: query }})
            .count((err, count) => {
                assert.equal(err, null);
                callback(count);
            });
    };


    this.getItem = function(itemId, callback) {
        "use strict";

        /*
         * TODO-lab3
         *
         * LAB #3: Query the "item" collection by _id and pass the matching item
         * to the callback function.
         *
         */
        
        var item = this.createDummyItem();

        // TODO-lab3 Replace all code above (in this method).

        callback(item);
    };


    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";

        /*
         * TODO-lab4
         *
         * LAB #4: Add a review to an item document. Reviews are stored as an 
         * array value for the key "reviews". Each review has the fields: "name", "comment", 
         * "stars", and "date".
         *
         */

        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        };

        var dummyItem = this.createDummyItem();
        dummyItem.reviews = [reviewDoc];
        callback(dummyItem);
    };


    this.createDummyItem = function() {
        "use strict";

        return {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

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
