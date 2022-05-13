/* eslint-disable no-unused-vars */
import multer, { FileFilterCallback } from "multer";
import { Express, Request } from "express";
import { v4 as uuidv4 } from "uuid";

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;

const fileStorage = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: DestinationCallback
  ) {
    cb(null, "./uploads/");
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: FileNameCallback
  ) {
    cb(null, uuidv4() + file.originalname);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
    return;
  }
  cb(new Error("Invalid file type!"));
};

const multerUpload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 1024 ** 2 * 5,
  },
  fileFilter,
});

export { fileStorage, fileFilter, multerUpload };
