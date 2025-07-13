import JobForm from "../model/jobform_model.js";

export const submitjobform = async (req, res) => {
  try {
    const {
      selectedJobs,
      selectedLocation,
      selecteexp,
      email,
      selectTime,
      selectampm,
      selectNumberofJobs,
      selectJobType,
      status,
      plantype
    } = req.body;

    const jobcretaedat = new Date();
    const jobexpiry = new Date(jobcretaedat); 
    jobexpiry.setDate(jobexpiry.getDate() + 30); 
    console.log("Job created at:", jobcretaedat);
    console.log("Job expiry date:", new Date(jobexpiry));

    let jobtitle = [];
    selectedJobs.map((item) => {
      jobtitle.push(item.title);
    });
    console.log(selectJobType,selectedLocation,selecteexp,jobtitle,selectTime,selectampm,selectNumberofJobs,email,plantype,status);

    // Basic validation (optional, already handled by Mongoose)
   

    await JobForm.create({
        jobtitle:jobtitle,
        joblocation: selectedLocation,
        exp: selecteexp,
        email: email,
        hrtime: selectTime,
        ampm: selectampm,
        jobnumber: selectNumberofJobs,
        jobtype: selectJobType,
        createdAt: jobcretaedat,
        expiryDate: jobexpiry,
        lastSentAt: null,
        status: status,
        plantype: plantype
    })

    return res.status(201).json({
      success: true,
      message: "Job form created successfully",
    //   data: newForm
    });

  } catch (error) {
    console.error("❌ Error saving job form:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error in creating job form",
      error: error.message
    });
  }
};
