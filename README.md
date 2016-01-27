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
       err_type: 'ADDR',
       err_message: 'Default address: The address you entered was found but more information is needed (such as an apartment, suite, or box number) to match to a specific address.',
       errors: []
    },

Please refer to the Easypost docs for more information about address verification errors.

## API Endpoints
All endpoints are prefixed with:

    https://api.voodoomfg.com/api/1

### POST /model
Creates a model on the server. Response contains the ID used to refer to that model when constructing an order.

Expects one parameters: the download url of the model you're creating.

    # Example request body
    {
        "file_url": <url of object file>
    }

    # Example response
    { 
        id: 1696,
        volume: 260616.764764193,
        x: 97.4320030212402,
        y: 122.105209350586,
        z: 132.524459838867 
    }

### GET /materials
Gets a list of available materials from the server.

    # Example request body
    {}

    # Example response
    [{"color': u'True Red', u'type': u'PLA', u'id': 1},
     {"color': u'True Brown', u'type': u'PLA', u'id': 2},
     ...]
    # Truncated for brevity

### GET /model/quote
Gets the quote for a single model file for a given quantity, material, and unit scale.

Expects four parameters, the model id, material id, quantity, and selected units.

    # Example request body
    { 
        model_id: 1696,
        units: "mm",
        material_id: 44,
        qty: 1 
    }

    # Response
    { 
        model_id: 1696,
        units: "mm",
        material_id: 44,
        qty: 1,
        quote: 29.413041769720596,
    }

### POST /order/shipping
Creates a shipment for the uploaded items and returns a list of shipping options for that shipment.

Expects two parameters, a list of items to order and an address to ship them to. Use the "value" field in each entry to select that shipping option in the next step (creating an order).

    # Example request body
    {
        "models": [
            {"material_id": 44, "model_id": 1696, "qty": 1, units: "mm"}
        ],

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
        rates: [{
            value: 'pickup',
            guaranteed: true,
            display_name: 'Pickup',
            price: 0,
            est_delivery: 0,
            additional_item_charge: 0 
        }, { 
            value: 'rate_9739688b70784834bdb2e1eb5afcdb38',
            service: 'PRIORITY_OVERNIGHT',
            guaranteed: true,
            display_name: 'FedEx - Priority Overnight',
            price: 27.38,
            delivery_date: '2016-02-01T10:30:00Z',
            additional_item_charge: 0 
        }, { 
            value: 'rate_ef3ab3182a3543be8cb0f70dde4a3c3e',
            service: 'FEDEX_2_DAY',
            guaranteed: true,
            display_name: 'FedEx - Fedex 2 Day',
            price: 18.28,
            delivery_date: '2016-02-02T16:30:00Z',
            additional_item_charge: 0 
        }, { 
            value: 'rate_0b011e90eb824e8ab72cbae2e4b7dda9',
            service: 'FEDEX_GROUND',
            guaranteed: false,
            display_name: 'FedEx - Fedex Ground',
            price: 7.22,
            delivery_date: '2016-02-01T17:00:00.302Z',
            additional_item_charge: 0 
        }]
    }

### POST /order/create
Creates an order on the server. Response contains the quote for that order.

Expects two parameters, a list of items to order and a shipment id (the "value" field in a rate). See the example:

    # Example request body    
    {
        "models": [
            {"material_id": 44, "model_id": 1696, "qty": 1, units: "mm"}
        ],

        "shipment_id": "rate_0b011e90eb824e8ab72cbae2e4b7dda9"
    }

    # Response
    { 
        quote: { 
            extras: <not used>,
            items: 29.41,
            shipping: 7.22,
            total: 36.63 
        },
        order_items: [{ 
            qty: 1, material_id: 44, units: 'mm', id: 1696 
        }],
        shipping: { delivery: 'rate_0b011e90eb824e8ab72cbae2e4b7dda9' },
        due_date: '2016-01-27T23:19:33.153Z',
        quote_id: 'f02af79251d5018ac7afeba4e3bc1dd34ee1fdc6f12a883a23a6f317eff77ddf' 
    }

The only important thing in the response is the quote_id, which will be used in the next step to confirm and place the order.

### POST /order/confirm
Confirms an order. You will not be charged, and no items will be manufactured or delivered, until this endpoint is hit with a valid quote id. Quote ids are generated by /order/create.

The endpoint accepts a single parameter, the id for the quote that you'd like to execute. On success, the response will echo back the details of the order.

    # Example request body
    {
        "quote_id": "f02af79251d5018ac7afeba4e3bc1dd34ee1fdc6f12a883a23a6f317eff77ddf"
    }

    # Response
    { 
        quote: { 
            extras: <not used>,
            items: 29.41,
            shipping: 7.22,
            total: 36.63 
        },
        order_items: [{ 
            qty: 1, units: 'mm', id: 1696, material: <material details>
        }],
        shipping: 'rate_0b011e90eb824e8ab72cbae2e4b7dda9',
        purchased: true,
        order_id: 216 
    }


## Example flow

* POST /model to get a model id
* GET /materials to find the desired material ID
* GET /model/quote to get the price for a model in a given quantity, material, and units
* POST /order/shipping to create and list shipping options for the order
* POST /order/create with the model ID, material ID, and shipping option to receive a quote
* POST /order/confirm with a quote id to confirm the order
