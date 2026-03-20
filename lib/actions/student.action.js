// Student server actions
"use server"
import mongoose from 'mongoose';
import { Student } from "@/models/student.model";
import User from "@/models/user.model";
import bcrypt from 'bcrypt'
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectToDB } from "../Database/connectToDB";

export const addStudent = async (FormData) => {
  const {
    Name,
    Parent,
    Class,
    DOB,
    Gender,
    Bio,
    section,
    Address,
    Phone,
    Email,
    Password,
    hasPaid,
    photo,
  } = Object.fromEntries(FormData.entries());

  try {
    await connectToDB();
    
    if (Email && Email.trim() !== '') {
      const existingStudent = await Student.findOne({ Email: Email.trim() });
      if (existingStudent) {
        return { error: 'A student with this email already exists' };
      }
    }

    const studentData = {
      Name,
      DOB,
      Gender,
      Bio,
      Address,
      Phone,
      Email,
      Password,
      hasPaid: hasPaid === 'on' || hasPaid === 'true',
      photo,
    };

    if (Class && Class.trim() !== '') {
      studentData.Class = new mongoose.Types.ObjectId(Class);
    }
    if (Parent && Parent.trim() !== '') {
      studentData.Parent = new mongoose.Types.ObjectId(Parent);
    }
    if (section && section.trim() !== '') {
      studentData.section = new mongoose.Types.ObjectId(section);
    }

    const newStudent = new Student(studentData);
    await newStudent.save();

    if (Email && Password) {
      const hashedPassword = await bcrypt.hash(Password, 10)
      const newUser = new User({
        name: Name,
        email: Email,
        password: hashedPassword,
        role: 'student'
      })
      await newUser.save()
    }
  } catch (error) {
    console.error('addStudent error', error);
    return { error: 'Failed to add student' };
  }

  revalidatePath('/student');
  redirect('/student');
}

export const updateStudent = async (FormData) => {
  const formDataObj = Object.fromEntries(FormData.entries())
  const {
    id,
    Name,
    Parent,
    Class,
    DOB,
    Gender,
    Bio,
    section,
    Address,
    Phone,
    Email,
    Password,
    hasPaid,
    photo,
  } = formDataObj;

  console.log('updateStudent id:', id)

  if (!id) {
    return { error: 'Student ID is required' }
  }

  try {
    await connectToDB();
    const updateFields = {
      Name,
      DOB,
      Gender,
      Bio,
      Address,
      Phone,
      Email,
      Password,
      hasPaid: hasPaid === 'on' || hasPaid === 'true',
      photo,
    };

    if (Class && Class.trim() !== '') {
      updateFields.Class = new mongoose.Types.ObjectId(Class);
    }
    if (Parent && Parent.trim() !== '') {
      updateFields.Parent = new mongoose.Types.ObjectId(Parent);
    }
    if (section && section.trim() !== '') {
      updateFields.section = new mongoose.Types.ObjectId(section);
    }

    Object.keys(updateFields).forEach(
      (key) => (updateFields[key] === '' || updateFields[key] === undefined) && delete updateFields[key]
    );

    await Student.findByIdAndUpdate(id, updateFields);
    console.log('Student updated successfully');
  } catch (error) {
    console.error('updateStudent error', error);
    return { error: 'Failed to update student: ' + error.message };
  }

  revalidatePath('/student');
  redirect(`/student`);
};

export const deleteStudent = async (FormData) => {
  const { id } = Object.fromEntries(FormData);
  try {
    await connectToDB();
    await Student.findByIdAndDelete(id);
  } catch (error) {
    console.error('deleteStudent error', error);
    throw new Error('Failed to delete student');
  }
  revalidatePath('/student');
  redirect('/student');
};
