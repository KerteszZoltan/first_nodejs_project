import { Request, Response } from "express";
import { getUser, deleteUserById, getUserById, UserModel } from "../../models/User";
import { Connect, CloseConnect } from "../../configs/databaseConnect";
import { updateUserById } from "../../models/User";
import {authentication, random} from '../../helpers/index';
import { sanitizeNestedInput } from "../../helpers/sanityzer";



export const getAllUsers = async (req: Request,res:Response) => {
    await Connect();
    try {
        const users = await getUser();
        CloseConnect();
        res.json(users).status(200);
        return;
    } catch (error) {
        CloseConnect();
        console.log(error);
        res.sendStatus(400).json(error);
        return;
    }
}

export const getOneUser = async (req:Request, res:Response) => {
    await Connect();
    try {
        const {id} = req.params;
        const user = await getUserById(id);
        if (!user) {
            CloseConnect();
            res.status(404).json({ error: "User not found" });
            return;
        }
        CloseConnect();
        res.json(user).status(200);
        return;
    } catch (error) {
        CloseConnect();
        console.log(error);
        res.sendStatus(400).json(error);
        return;
    }
}

export const deleteUser = async (req:Request, res:Response)=>{
    await Connect();
    try {
        const {id} = req.params;
        const deletedUser = await deleteUserById(id);
        CloseConnect();
        res.json(deletedUser).status(200);
        return;
    }catch(error){
        console.log(error);
        CloseConnect();
        res.sendStatus(400).json(error);
        return;
    }
} 

export const updateUser = async (req:Request, res:Response)=>{
    await Connect();
    const salt = random();
    try{
        const {id} =req.params;
        const user = await getUserById(id);
        if (!user) {
            CloseConnect();
            res.sendStatus(404).json({ error: "User not found" });
            return;
        }

        const sanitizedUsername = sanitizeNestedInput(req.body.username);
        const sanitizedEmail = sanitizeNestedInput(req.body.email);


        const updatingUser = {
            username: req.body.username ? sanitizedUsername : user.username,
            email: req.body.email ? sanitizedEmail : user.email,
            authentication: {
                password: req.body.password ? authentication(req.body.password, salt) : user.authentication?.password ?? '',
                salt: req.body.password ? salt : user.authentication?.salt ?? '',
            }
        }

        await updateUserById(id, updatingUser);
        res.json(updatingUser).status(200);
        return;

    }catch(error){
        res.status(400).json(error);
        return;
    }
}