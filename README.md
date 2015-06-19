# Voodoo API

## Authorization
Every request must include the following headers:

    "key": <your api key>
    "content-type": "application/json"

The API only responds to HTTPS, so your key should be safe as long as you don't share it with anybody else. If this token is attached to your request, the server will authorize it and perform the requested action.

## Content type
The API server only accepts parameters passed in a JSON encoded body. This also needs to be set in the headers.

## Restrictions on uploaded files
Only .STL and .OBJ files are accepted. The parser currently determines file type based on the extension of file in the download URL.

    http://myfile.com/model.stl # parsed as STL
    http://myfile.com/model.obj # parsed as OBJ
    http://myfile.com/model     # won't work

## Shipping Errors
In the case of an invalid address, you will get a response back like this one:

    {
       code: 'ADDRESS.VERIFY.FAILURE',
       message: 'Default address: The address you entered was found but more information is needed (such as an apartment, suite, or box number) to match to a specific address.',
       errors: []
    },

Please refer to the Easypost docs for more information about address verification errors.

## API Endpoints
All endpoints are prefixed with:

    https://api.voodoomfg.co/api/0

### GET /materials
Gets a list of available materials from the server.

    # Example request body
    {}

    # Example response
    [{"color': u'True Red', u'type': u'PLA', u'id': 1},
     {"color': u'True Brown', u'type': u'PLA', u'id': 2},
     ...]
    # Truncated for brevity

### POST /order/create_and_confirm
Creates a model on the server, creates an order for it, and then confirms the order. Response contains the price paid for the model, shipping, and tax, along with an order id for your records.

Expects two parameters, a list of models with their file locations to order and an address to ship them to. See the example:

    # Example request body
    {
        "order_items": {[
            {
                "model": { "file_url": "http://myfile.com/file.stl", "dimensions": "mm" },
                "material": 34,
                "qty": 1
            }
        ]},

        "shipping_info": {
            "city": "Test city",
            "name": "Test name",
            "zip": "12345",
            "street1": "123 Test Rd",
            "street2": "#1", # optional!
            "state": "AK",
            "country": "USA"
        }
    }

    # Response
    {
        "order_id": 12,
        "purchased": true,
        "quote": {
            "items": 263814.55,
            "total": 290196.01,
            "tax": 26381.46,
            "shipping": 0
        },
        "shipping_info": {
            "city": "Test city",
            "name": "Test name",
            "zip": "12345",
            "street1": "123 Test Rd",
            "street2": "#1", # optional!
            "state": "AK",
            "country": "USA"
        }
        "order_items": [
            {"material": 34, "id": 25, "qty": 1}
        ]
    }


### POST /model
Creates a model on the server. Response contains the ID used to refer to that model when constructing an order.

Expects two parameters: the first the url of the file to use to create the model. The second parameter is the units of the uploaded file ("mm", "in")

    # Example request body
    {
        "file_url": <url of object file>,
        "units": <units, "mm", etc>
    }

    # Example response
    {
        "user_id": 1,
        "deletedAt": None,
        "file_uri": "3c911686-4bbe-4fb7-b08e-354e88f1274b.stl",
        "volume": 263703.684920517,
        "updatedAt":"2015-06-15T15:23:21.122Z",
        "y": 63.9124984741211,
        "x": 155.777496337891,
        "z": 110.86499786377,
        "id": 25,
        "createdAt": u'2015-06-15T15:23:21.122Z'
    }

### POST /order/create
Creates an order on the server. Response contains the quote for that order.

Expects two parameters, a list of items to order and an address to ship them to. See the example:

Material IDs are discovered using the /materials endpoint.

    # Example request body
    {
        "order_items": {
            [{"material": 34, "id": 25, "qty": 1}],
        },

        "shipping_info": {
            "city": "Test city",
            "name": "Test name",
            "zip": "12345",
            "street1": "123 Test Rd",
            "street2": "#1", # optional!
            "state": "AK",
            "country": "USA"
        }
    }

    # Response
    {
        "quote_id": "123456",
        "quote": {
            "items": 263814.55,
            "total": 290196.01,
            "tax": 26381.46,
            "shipping": 0
        },
        "shipping_info": {
            "city": "Test city",
            "name": "Test name",
            "zip": "12345",
            "street1": "123 Test Rd",
            "street2": "#1", # optional!
            "state": "AK",
            "country": "USA"
        }
        "order_items": [
            {"material": 34, "id": 25, "qty": 1}
        ]
    }

### POST /order/confirm
Confirms an order. You will not be charged, and no items will be manufactured or delivered, until this endpoint is hit with a valid quote id. Quote ids are generated by /order/create.

The endpoint accepts a single parameter, the id for the quote that you'd like to execute. On success, the response will echo back the details of the order. The response will be the same as /order/create, except that the quote_id field will be replaced with an order_id field.

    # Example request body
    {
        "quote_id": "123456"
    }

    # Response
    {
        "order_id": "99999",
        "purchased": true,
        "quote": {
            "items": 263814.55,
            "total": 290196.01,
            "tax": 26381.46,
            "shipping": 0
        },
        "shipping_info": {
            "city": "Test city",
            "name": "Test name",
            "zip": "12345",
            "street1": "123 Test Rd",
            "street2": "#1", # optional!
            "state": "AK",
            "country": "USA"
        }
        "order_items": [
            {"material": 34, "id": 25, "qty": 1}
        ]
    }


## Example flow

* POST /model to get a model id
* GET /materials to find the desired material ID
* POST /order/create with the model ID, material ID, and shipping address to receive a quote
* POST /order/confirm with a quote id to confirm the order
