const express= require('express');
const User=require('./user');
const router=express.Router();



//Create New User
router.post('/users',async(req,res)=>{
    try{
        const user= new User(req.body);
        await user.save();
        res.status(201).json(user);
    }catch(error) {
        if(error.code==11000){
            const field=Object.keys(error.keyValue)[0];
            if(field='email'){
                return res.status(400).json({error:"Email Address is already in use."});
            }
            if( field='username'){
                return res.status(400).json({error:"Username is already taken."})
            }
            res.status(500).json({error:`Error creating user: ${error.message}`});
        }
      }
    
})

// Read All Users
router.get('/users',async(req,res)=>{
    try{
        const users=await User.find();
        res.status(200).json(users);
    } catch (error){
        res.status(500).json({error:`Error fetching users:${error.message}`});       
    }
})

//Readd User by Id
router.put('/user/id:',async(req,res)=>{
    try{
           const user=await User.findById(req.params.id,req.body,{new:true});
           if (!user){
            return res.status(404).json({error:'User not found'});
            }
            res.status(200).json(user);
        } catch(error){
            if (error.code === 11000) {
            const field=Object.keys(error.keyValue)[0];
            if (field === 'email') {
                return res.status(400).json({ error: 'Email address is already in use.' });
            }
            if (field === 'username') {
                return res.status(400).json({ error: 'Username is already taken.' });
            }
         }
          res.status(500).json({error:`Error updating user: ${error.message}`}); 
        }
  
  })

 // Delete User by ID
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: `Error deleting user: ${error.message}` });
    }
});

module.exports = router; 