import Service from "../models/Service.js";

/* =========================
CREATE SERVICE
========================= */

export const createService = async (req,res)=>{

try{

const service =
await Service.create({

...req.body,

createdBy:req.user._id

});

res.status(201).json({

success:true,

message:
"Service created successfully",

service

});

}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};

/* =========================
GET ALL SERVICES
========================= */

export const getServices = async (req,res)=>{

try{

const services =
await Service.find()
.sort({createdAt:-1});

res.status(200).json({

success:true,
count:services.length,
services

});

}catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};

/* =========================
GET SINGLE SERVICE
========================= */

export const getSingleService = async (req,res)=>{

try{

const service =
await Service.findById(
req.params.id
);

if(!service){

return res.status(404).json({

success:false,

message:
"Service not found"

});

}

res.status(200).json({

success:true,
service

});

}catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};

/* =========================
UPDATE SERVICE
========================= */

export const updateService = async (req,res)=>{

try{

const service =
await Service.findByIdAndUpdate(

req.params.id,

req.body,

{
new:true,
runValidators:true
}

);

if(!service){

return res.status(404).json({

success:false,

message:
"Service not found"

});

}

res.status(200).json({

success:true,

message:
"Service updated successfully",

service

});

}catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};

/* =========================
DELETE SERVICE
========================= */

export const deleteService = async (req,res)=>{

try{

const service =
await Service.findById(
req.params.id
);

if(!service){

return res.status(404).json({

success:false,

message:
"Service not found"

});

}

await service.deleteOne();

res.status(200).json({

success:true,

message:
"Service deleted successfully"

});

}catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};