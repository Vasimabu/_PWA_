const express =require('express')
const router=express.Router()
const studentController=require('../controllers/studentController')
const outerController=require('../controllers/outerController')


//view records
router.get('/',studentController.view)

//add new record //saverecords
router.get('/adduser',studentController.adduser)
router.post('/adduser',studentController.save)

//update records //save records
router.get('/edituser/:id',studentController.editUserForm)
router.post('/edituser/:id',studentController.updateUser)

//delete records
router.get('/deleteuser/:id',studentController.delete)

//select city dropdown
router.get('/cities',outerController.getCities)
router.get('/filteredByCity',outerController.handleCityFilter)

//grt api
// router.get('/api',outerController.fixtures)




/* router.get('', (req, res) => {
    res.render('home');
}); */

module.exports=router