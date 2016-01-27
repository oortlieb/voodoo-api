var co = require('co');
var api = require('./voodoo-api');

function* main() {
    var fileUrl = process.argv[2];
    var model = yield api.createModel(fileUrl);

    console.log("MODEL!");
    console.log(model);

    var materials = yield api.getMaterials();

    console.log("materials!");
    console.log(materials);

    // a little messy, but just getting the material id for the material and
    // color we want
    var desiredMaterial = materials.filter(function(m) {
        return m.type === "Ninjaflex" && m.color === "Flamingo";
    })[0];

    var model = {
        model_id: model.id, qty: 1, material_id: desiredMaterial.id, units: "mm"
    };

    var itemQuote = yield api.getItemQuote(model);

    console.log("itemquote")
    console.log(itemQuote);

    var shippingAddress = {
        email: "oortlieb@gmail.com",
        name: "Oliver Ortlieb",
        street1: "361 Stagg Street",
        street2: "#408",
        city: "Brooklyn",
        state: "NY",
        zip: "11211",
        country: "US"
    };

    var models = [model];
    var shippingOptions = yield api.getShippingOptions(models, shippingAddress);

    console.log("shippingOptions")
    console.log(shippingOptions);

    var desiredRate = shippingOptions.rates.filter(function(rate) {
        return rate.service === "FEDEX_GROUND";
    })[0];

    var order = yield api.createOrder(models, desiredRate.value);

    console.log("order")
    console.log(order);

    var confirmation = yield api.confirmOrder(order.quote_id);

    console.log("confirmation")
    console.log(confirmation);

    return confirmation;
}

co(main).then(function(r) {
    console.log(r);
    process.exit(0)
}).catch(function(e) {
    console.log(e.stack || e);
});
