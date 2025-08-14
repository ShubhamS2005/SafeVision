import {User} from "../models/user_scheema.js"
import {catchAsyncErrors} from "../middleware/CatchAssyncErrors.js"
import ErrorHandler from "../middleware/errormiddleware.js"
import {generateToken} from "../utils/jwtToken.js"
import cloudinary from "cloudinary"
import { config } from "dotenv";
import { Resend } from 'resend';
config({ path: "./config/config.env" });
const resend = new Resend(process.env.RESEND_API_KEY);

export const UserRegister=catchAsyncErrors(async(req,res,next)=>{
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("User Avatar Required!", 400));
      }
    const { userAvatar } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(userAvatar.mimetype)) {
        return next(new ErrorHandler("File Format Not Supported!", 400));
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
        userAvatar.tempFilePath
      );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error(
          "Cloudinary Error:",
          cloudinaryResponse.error || "Unknown Cloudinary error"
        );
        return next(
          new ErrorHandler("Failed To Upload User Avatar To Cloudinary", 500)
        );
    }
    

    const{firstname,lastname,email,phone,password,role}=req.body
    if(!firstname||!lastname||!email||!phone||!password||!role){
        return next(new ErrorHandler("Please fill full form",400));
    }
    const user=await User.findOne({email})
    if(user){
        return next(new ErrorHandler("User Already registered",400));
    }
    else{
        const userData=await User.create({
            firstname,lastname,email,phone,password,role,
            userAvatar: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
              },
        })
        // generateToken(user,"user registered",200,res)
        sendVerifymail(firstname,lastname,email,userData._id)
        res.status(200).json({
            success:true,
            message:"User Registered,Verify your mail"
        })
    }
})

//Send Mail
export const sendVerifymail = async (firstname, lastname, email, user_id) => {
    try {
      const subject = 'SafeVision Account Verification';
      const verificationLink = `http://127.0.0.1:${process.env.PORT}/verify?id=${user_id}`;
  
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2E7D32;">Hello ${firstname} ${lastname},</h2>
            <p style="font-size: 16px; color: #333;">Your account has been created on <strong>SafeVision</strong>. Please verify your account by clicking the button below:</p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${verificationLink}" style="padding: 12px 20px; background-color: #2E7D32; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
                Verify My Account
              </a>
            </div>
            
            <p style="font-size: 14px; color: #777;">If the button above doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="font-size: 14px; color: #555;"><a href="${verificationLink}">${verificationLink}</a></p>
            
            <hr style="margin-top: 30px;" />
            <p style="font-size: 12px; color: #aaa;">This is an automated message from SafeVision. Please do not reply.</p>
          </div>
        </div>
      `;
  
      const result = await resend.emails.send({
        from: 'SafeVision <onboarding@resend.dev>',
        to: email,
        subject,
        html,
      });
  
      console.log('✅ Email sent:', result);
    } catch (error) {
      console.error('❌ Error sending verification email:', error.message);
    }
  };

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword || !role) {
    return next(new ErrorHandler("Please provide all details", 400));
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Password and confirm password not same", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  if (role !== user.role) {
    return next(new ErrorHandler("User with this role not found", 400));
  }

  if (user.isVerified === 0) {
    return next(new ErrorHandler("User is not verified. Please click the link sent to you.", 403));
  }

  generateToken(user, "User Logged in Successfully", 200, res);
});


export const AddNewUser = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("User Avatar Required!", 400));
    }

    const { userAvatar } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(userAvatar.mimetype)) {
        return next(new ErrorHandler("File Format Not Supported!", 400));
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(
        userAvatar.tempFilePath
    );

    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown error");
        return next(new ErrorHandler("Failed To Upload Avatar To Cloudinary", 500));
    }

    const { firstname, lastname, email, phone, password, role, assignedZones } = req.body;

    if (!firstname || !lastname || !email || !phone || !password || !role) {
        return next(new ErrorHandler("Please fill all required fields", 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorHandler(`${existingUser.role} with this email already exists`, 400));
    }

    // Validate role
    const allowedRoles = ["Admin", "Supervisor"];
    if (!allowedRoles.includes(role)) {
        return next(new ErrorHandler("Invalid role. Only Admin or Supervisor allowed.", 400));
    }

    const userData = {
        firstname,
        lastname,
        email,
        phone,
        password,
        role,
        isVerified: 1,
        userAvatar: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        }
    };

    // Optional: Add assignedZones for supervisors
    if (role === "Supervisor" && assignedZones) {
        try {
            userData.assignedZones = JSON.parse(assignedZones);
        } catch (err) {
            return next(new ErrorHandler("assignedZones must be a valid JSON array", 400));
        }
    }

    const newUser = await User.create(userData);

    res.status(200).json({
        success: true,
        message: `${role} added successfully`,
        user: newUser
    });
});


export const GetUser=catchAsyncErrors(async(req,res,next)=>{
    const user=req.user
    res.status(200).json({
        success:true,
        user
    })

})



export const AdminLogout=catchAsyncErrors(async(req,res,next)=>{
    res.status(200).cookie("adminToken","",{
        httpOnly:true,
        expires:new Date(Date.now()),
        
    }).json({
        success:true,
        message:"Admin Log out succesfully"
    })
})

export const SupervisorLogout=catchAsyncErrors(async(req,res,next)=>{
    res.status(200).cookie("supervisorToken","",{
        httpOnly:true,
        expires:new Date(Date.now()),
        
    }).json({
        success:true,
        message:"Supervisor Log out succesfully"
    })
})


// export const UpdateUserElement=catchAsyncErrors(async(req,res,next)=>{
//     const {id}=req.params
//     const {SP_Role,doctorDepartment}=req.body
    
//     let user=await User.findByIdAndUpdate(id,
//         {
//         SP_Role:SP_Role,
//         doctorDepartment:doctorDepartment,
//         },{
//         new:true,
//         runValidators:true,
//         useFindAndModify:false,
//     })
//     res.status(200).json({
//         success:true,
//         message:"Status Updated",
//         user,
//     })
//   })

  export const UpdateElementId = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    console.log(req.body); // Check content of req.body

    let user = await User.findById(id);
    if (!user) {
        return next(new ErrorHandler("User Not Found", 404));
    }

    // Update user details
    user = await User.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: "User Details Updated",
        user,
    });
});



// controllers/userController.js
export const assignZonesToSupervisor = catchAsyncErrors(async (req, res, next) => {
  const { zones } = req.body;
  const supervisorId = req.params.id;

  const supervisor = await User.findById(supervisorId);

  if (!supervisor || supervisor.role !== "Supervisor") {
    return next(new ErrorHandler("Supervisor not found", 404));
  }

  supervisor.assignedZones = zones;
  await supervisor.save();

  res.status(200).json({
    success: true,
    message: "Zones assigned successfully",
    supervisor,
  });
});


export const getAllSupervisors = catchAsyncErrors(async (req, res, next) => {
    const supervisors = await User.find({ role: "Supervisor" });
    res.status(200).json({
        success: true,
        supervisors
    });
});

export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    });
});
