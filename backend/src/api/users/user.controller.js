import * as userService from "./user.service.js";
import httpStatus from "http-status-codes";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(httpStatus.CREATED).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(httpStatus.OK).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUsers = async (req, res, next) => {
  try {
    const { ids } = req.body;
    await userService.deleteUsers(ids);
    res
      .status(httpStatus.OK)
      .json({ success: true, message: "Users deleted successfully" });
  } catch (error) {
    next(error);
  }
};
