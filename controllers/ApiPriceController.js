var User = require("../database/models/users")
var Product = require("../database/models/products")
var Shop = require("../database/models/shops")
var Price = require("../database/models/prices")
const Sequelize = require("sequelize");
const Op = Sequelize.Op


const ApiPriceController = (req, res) => {
}
function toRadians (angle) {
    return angle * (Math.PI / 180);
  }

function distance ( lat1,lat2,lon1,lon2){
    var R = 6371e3; // metres
    var f1 = toRadians(lat1);
    var f2 = toRadians(lat2)
    var Df = toRadians((lat2-lat1));
    var Dl = toRadians((lon2-lon1));
    
    var a = Math.sin(Df/2) * Math.sin(Df/2) +
            Math.cos(f1) * Math.cos(f2) *
            Math.sin(Dl/2) * Math.sin(Dl/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    var d = R * c;
    return d ; 
}


ApiPriceController.prices = (req, res) => {
    var whereClause = {} 
    var start = 0
    var count = 20
    var sort= {}
    sort[0] = 'price'
    sort[1] = 'ASC'
    var temp, tempInt
    temp = req.query.start
    if (temp){
        tempInt = parseInt(temp)
        if (!isNaN(tempInt)){
            start = tempInt
        }
    }
    
    temp = req.query.count
    if (temp){
        tempInt = parseInt(temp)
        if (!isNaN(tempInt)){
            count = tempInt
        }
    }

    temp = req.query.shops
    if (temp){
        var temp2 = parseInt(temp)
        if (isNaN(temp2)){
            for (var i in temp){
                temp[i] = parseInt(temp[i])
            }
        }  
        else{
            temp = [temp]
        } 
        whereClause.shopId = { [Op.or]: temp }        
    }

    temp = req.query.products
    if (temp){
        var temp2 = parseInt(temp)
        if (isNaN(temp2)){
            for (var i in temp){
                temp[i] = parseInt(temp[i])
            } 
        } 
        else{
            temp = [temp]
        }
        whereClause.productId = { [Op.or]: temp }        
    }
    temp = req.query.sort
    if (temp != null){       
        sort = temp.split('|')
    }   

    date = new Date()
    date.setHours(2,0,0,0) //Due to time difference if I set all hours to zero date gets one day earlier at 22:00 (24:00 at Greenwich)
    dateFrom = date
    dateTo = date

    if (req.query.dateFrom && req.query.dateTo){
        dateFrom = new Date(req.query.dateFrom)
        dateFrom.setHours(2,0,0,0)
        dateTo = new Date (req.query.dateTo)
        dateTo.setHours(2,0,0,0)
    }
    whereClause.date = {[Op.and]: {[Op.gte]: dateFrom, [Op.lte]: dateTo}}
    Price.findAndCountAll({include: [{model: Product, attributes: ['name','tags']},{model: Shop, attributes: ['name','tags','address','lat','lng']}], where: whereClause , order:[[sort[0],sort[1]]]  }).then(result => {
        var temp
        var total = result.count;
        var slice = result.rows.slice(start,start+count);
        var found1 
        var found2
        var deleted
        for (var i in slice){
            deleted = false
            slice[i] = JSON.stringify(slice[i])
            slice[i] = JSON.parse(slice[i])
            var lat = slice[i].shop.lat
            var lng = slice[i].shop.lng
            var prod = slice[i].product
            delete slice[i].product
            slice[i].productName = prod.name
            slice[i].productTags = prod.tags

            var shop = slice[i].shop
            delete slice[i].shop
            slice[i].shopName =shop.name
            slice[i].shopTags = shop.tags  
            slice[i].shopAddress = shop.address

            temp = req.query.tags
            if (typeof temp === 'string' || temp instanceof String){
                temp = [temp]
            }
            if(temp){
                if(slice[i].productTags){
                    found1 = temp.some(r=> slice[i].productTags.indexOf(r) >= 0)
                }
                else{
                    found1 = false
                }
                if(slice[i].shopTags){
                    found2 = temp.some(r=> slice[i].shopTags.indexOf(r) >= 0)
                }
                else{
                    found2 = false
                }
                if(!found1 && !found2){
                    delete slice[i]
                    total = total - 1
                    deleted = true
                    
                }
                if (req.query.geoDist && !deleted){
                    var dist = distance (req.query.geoLat, lat, req.query.geoLng,lng)
                    if(dist/1000 > req.query.geoDist){
                        delete slice[i]
                        total = total - 1
                        deleted = true
                    }
                }

            }
        }
        var text = '{ "start" : ' + start.toString() + ' , "count" : ' + count.toString() + ', "total" : ' + total.toString() +  '}';
        var response = JSON.parse(text);
        var slice = slice.filter(function (el) {
            return el != null;
          });
        response.prices = slice
        res.send(response)
    })
};

ApiPriceController.addPrice = (req, res) => {
    
    sname = req.body.name.toString()
    saddress = req.body.address.toString()
    slng = req.body.lng.toString()
    slat = req.body.lat.toString()
    stags = req.body.tags.toString() // We take as granted that tags have been sent to us as one String and tags are seperated with commas
        
  
    Shop.create({
        name: sname,
        address: saddress,
        lng: slng,
        lat: slat,
        tags: stags
    }).then(shop => {
        if (shop){
            res.status(200).send(shop)
        }
        else{
            res.sendStatus(400)
        }   
    })

}



module.exports = ApiPriceController;
