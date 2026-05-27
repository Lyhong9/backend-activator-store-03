const express = require('express');
const router = express.Router();
const { User, UserImage } = require('../../models');
const { v4: uuidv4 } = require('uuid');
const path = require('path');         
const fs = require('fs'); 

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const user = await User.findByPk(id, {
      include: [{
        model: UserImage,
        as: 'userImages',
        attributes: ['id', 'imageUrl', 'fileName'],
      }],
    });

    if (!user) {
      return res.status(404).json({
        message: `User with id=${id} not found`,
      });
    }

    // Delete each image file from disk + DB record
    if (user.userImages && user.userImages.length > 0) {
      for (const image of user.userImages) {
        // Remove file from uploads/users folder
        const fileName = image.imageUrl.split('/').pop();
        const filePath = path.join(process.cwd(), 'uploads/users', fileName);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        // Remove image record from DB
        await image.destroy();
      }
    }

    await user.destroy();
    res.json({
      message: `User with id=${id} deleted successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Delete user failed',
      error: error.message,
    });
  }
});

router.delete("/images/:imageId", async (req, res) => {
  const { imageId } = req.params;

 const image = await UserImage.findOne({
    where: {
      id: imageId
    }
  })

  if(!image){
    return res.status(404).json({
      message: `User Image id=${imageId} not found`
    })
  }

  // remove image from folder uploads
  // const fileName = image.imageUrl.split("/").pop()

  const filePath = path.join(process.cwd(), "../uploads/users", fileName) // read root folder + uploads/users + fileName

  if(fs.existsSync(filePath)){ // check if file exist in folder uploads/users
    fs.unlinkSync(filePath) // remove file from folder uploads/users
  }

  // remove data from db
  await image.destroy()

  return res.json({
    message: "User Image deleted successfully"
  })

});

// Image upload
router.post("/:id/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const { file } = req.files;
    const userId = req.params.id;

    // validate user id
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: `User id=${userId} not found`,
      });
    }

    console.log("File", file);

    // UUI + file extension
    const fileName = `${uuidv4()}${path.extname(file.name)}`;

    //  Upload file to folder uploads/users
    //  Create file upload path
    const uploadPath = path.join(process.cwd(), "uploads/users", fileName);

    await file.mv(uploadPath);

    // Domain + fileName // domain.com/uploads/users/9871923712.png
    const domain = `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${domain}/uploads/users/${fileName}`;

    const savedImage = await UserImage.create({
      userId,
      imageUrl,
      fileName: file.name,
    });

    res.json({
      message: "Upload image successfully",
      data: savedImage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Upload image failed",
      error: error.message,
    });
  }
});

router.get('', async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: UserImage,
        as: 'userImages',
        attributes: ['id', 'imageUrl', 'fileName'],
      },
      ],
    });
    res.json({
      message: 'Get all users successfully',
      data: users,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const users = await User.findByPk(id, {
      include: [{
        model: UserImage,
        as: 'userImages',
        attributes: ['id', 'imageUrl', 'fileName'],
      }],
    });
    res.json({
      message: 'Get user successfully',
      data: users,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
