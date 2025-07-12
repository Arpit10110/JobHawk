export const submitjobform = async(req,res)=>{
    try {

        const data = await req.body;
        console.log(data)
            return res.json({
            success: true,
            message: 'Job form created successfully',
            })
        
    } catch (error) {
        return res.json({
            success: false,
            message: 'Error in creating job form',
            error: error.message
        })
    }
}