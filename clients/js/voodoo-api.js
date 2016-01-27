var request = require('request-promise');

var VOODOO_KEY = "1f70ee9b6c03a01b2efb9c8a8db47b149797e8d499ffca2245a17e26b732a827";

function authRequest(options) {
    options.headers = {
        "Content-Type": "application/json",
        "key": VOODOO_KEY
    };

    return options;
}

function createModel(modelUrl) {
    var options = {
        method: "POST",
        url: "http://localhost:5001/api/1/model",
        body: {
            file_url: modelUrl
        },
        json: true
    };

    return request(authRequest(options));
}

function getMaterials() {
    var options = {
        method: "GET",
        url: "http://localhost:5001/api/1/materials",
        json: true
    };

    return request(authRequest(options));
}

function getItemQuote(model) {
    var options = {
        method: "GET",
        url: "http://localhost:5001/api/1/model/quote",
        body: model,
        json: true
    };

    return request(authRequest(options));
}

function getShippingOptions(models, shipping_address) {
    var options = {
        method: "POST",
        url: "http://localhost:5001/api/1/order/shipping",
        body: {
            models: models,
            shipping_address: shipping_address
        },
        json: true
    };

    return request(authRequest(options));
}

function createOrder(models, shipment_id) {
    var options = {
        method: "POST",
        url: "http://localhost:5001/api/1/order/create",
        body: {
            models: models,
            shipment_id: shipment_id
        },
        json: true
    };

    return request(authRequest(options));
}

function confirmOrder(quote_id) {
    var options = {
        method: "POST",
        url: "http://localhost:5001/api/1/order/confirm",
        body: {
            quote_id: quote_id
        },
        json: true
    };

    return request(authRequest(options));
}

module.exports = {
    createModel: createModel,
    getMaterials: getMaterials,
    getItemQuote: getItemQuote,
    getShippingOptions: getShippingOptions,
    createOrder: createOrder,
    confirmOrder: confirmOrder
};
