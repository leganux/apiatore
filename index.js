#! /usr/bin/env node

const { program } = require('commander')
const path = require('path')
const fs = require('fs')
const makeDir = require('make-dir');
const { exec } = require("child_process");

async function sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}


program
    .command('apiatore')
    .description('Creates new controllers and routes files with APIATO functions')
    .option('-l, --location <location...>', 'The full file folder and path where the project will be created.  ')
    .action(async function ({ location }) {

        console.log('WELCOME to APIATORE. We gonna convert your models in routes and controllers. ')
        await sleep(1)
        console.log('starting...')
        await sleep(1)

        try {

            console.log('Checking parameters, before to proccess...')
            await sleep(1)

            if (!location || location == '' || location.length < 1) {
                console.error('Location is missing, tyr again')
                return 0
            }

            location = location[0]

            console.log('Step 1 -  Review location...', location)
            await sleep(1)

            location = path.join(location)
            if (!fs.existsSync(location)) {
                console.error('Folder location does not exist, try using full path')
                return 0
            }

            console.log('Step 2 -  Review models location...')
            await sleep(1)

            let modelsLocation = path.join(location, 'models')
            if (!fs.existsSync(modelsLocation)) {
                console.error('Folder models  does not exist, try using full path')
                return 0
            }

            console.log('Step 3 -  Review Controllers location...')
            await sleep(1)
            let controllersLocation = path.join(location, 'controllers')
            if (!fs.existsSync(controllersLocation)) {
                controllersLocation = await makeDir(controllersLocation);
            }

            console.log('Step 4 -  Review Routes location...')
            await sleep(1)
            let routesLocation = path.join(location, 'routes')
            if (!fs.existsSync(routesLocation)) {
                routesLocation = await makeDir(routesLocation);
            }

            console.log('Step 5 -  Load Models...')
            await sleep(1)

            let arrayOfFiles = fs.readdirSync(modelsLocation)

            arrayOfFiles = arrayOfFiles.filter(item => {
                return item.includes('model.js')
            })

            console.log(arrayOfFiles)

            console.log('Step 5 -  Proccess Models...')
            await sleep(1)

            for (let item of arrayOfFiles) {
                let name = item.replace('.model.js', '')

                let newPathController = path.join(controllersLocation, name + '.controller.js')
                let newPathRoutes = path.join(routesLocation, name + '.routes.js')

                console.log('Step 6 -  Proccess Model...', name)
                await sleep(1)

                if (!fs.existsSync(newPathController)) {

                    console.log('Step 6.1 -  Creating Controller ...', name)

                    fs.writeFileSync(newPathController, `
                    let ms = require('../helpers/apiato.helper')
                    let ${name}Model = require('../models/${name}.model')
                    
                    
                    // Add here validations for push data
                    let validationObject = {}
                    // Add here Population system
                    let populationObject = false
                    
                    // Add here options
                    let options = {}
                    
                    // Add here pipeline for datatable
                    let aggregate_pipeline_dt = []
                    
                    // Add here piepline for custom route
                    let aggregate_pipeline = []
                    
                    
                    module.exports = {
                        createOne: ms.createOne(${name}Model, validationObject, populationObject, options),
                        createMany: ms.createMany(${name}Model, validationObject, populationObject, options),
                    
                        getOneWhere: ms.getOneWhere(${name}Model, populationObject, options),
                        getOneById: ms.getOneById(${name}Model, populationObject, options),
                        getMany: ms.getMany(${name}Model, populationObject, options),
                    
                        findUpdateOrCreate: ms.findUpdateOrCreate(${name}Model, validationObject, populationObject, options),
                        findUpdate: ms.findUpdate(${name}Model, validationObject, populationObject, options),
                        updateById: ms.updateById(${name}Model, validationObject, populationObject, options),
                    
                        findIdAndDelete: ms.findIdAndDelete(${name}Model, options),
                    
                        datatable_aggregate: ms.datatable_aggregate(${name}Model, aggregate_pipeline_dt, ''),
                        aggregate: ms.aggregate(${name}Model, aggregate_pipeline, options),
                    }
                    ` )

                } else {
                    console.info(newPathController, 'Ya existe!')
                }

                if (!fs.existsSync(newPathRoutes)) {
                    console.log('Step 6.2 -  Creating Routes ...', name)

                    fs.writeFileSync(newPathRoutes, `
                    const express = require('express')
                    const router = express.Router()
                    
                    let ${name}Controller = require('../controllers/user.controller')
                    
                    
                    router.post('/${name}', ${name}Controller.createOne)
                    router.post('/${name}/many', ${name}Controller.createMany)
                    
                    router.get('/${name}/one', ${name}Controller.getOneWhere)
                    router.get('/${name}/:id', ${name}Controller.getOneById)
                    router.get('/${name}', ${name}Controller.getMany)
                    
                    router.put('/${name}/find_update_or_create', ${name}Controller.findUpdateOrCreate)
                    router.put('/${name}/find_where_and_update', ${name}Controller.findUpdate)
                    router.put('/${name}/:id', ${name}Controller.updateById)
                    
                    router.delete('/${name}/:id', ${name}Controller.findIdAndDelete)
                    
                    router.post('/${name}/datatable', ${name}Controller.datatable_aggregate)
                    router.post('/${name}/aggregate', ${name}Controller.aggregate)
                    
                    module.exports = router
                    `)
                }
                else {
                    console.info(newPathRoutes, 'Ya existe!')
                }

                console.log('Step 6 -  Fin Model...', name)

            }


            console.log('Step 7 -  Fininishing')
            await sleep(3)
            console.log('Thanks!!')

        } catch (error) {
            console.error('Error  :::: ', error)
            throw e
        }

    })


program.parse()