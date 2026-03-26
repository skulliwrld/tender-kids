"use server"

import { connectToDB } from "../Database/connectToDB"
import { Parent } from "@/models/parent.model"
import User from "@/models/user.model"
import bcrypt from 'bcrypt'
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export const addParent = async (formData) => {
  const { Name, Email, Phone, Profession, Address, Password, photo } = Object.fromEntries(formData)

  // Parse phone - handle empty strings, whitespace, and invalid values
  let phoneNumber = null;
  if (Phone && typeof Phone === 'string') {
    const trimmedPhone = Phone.trim();
    if (trimmedPhone !== '') {
      const parsed = Number(trimmedPhone);
      if (!isNaN(parsed)) {
        phoneNumber = parsed;
      }
    }
  }

  try {
    connectToDB()

    // Check if a parent with this email already exists in Parent collection
    const existingParent = await Parent.findOne({ Email })
    if (existingParent) {
      throw new Error("A parent with this email already exists")
    }

    // Check if user already exists (any role)
    const existingUser = await User.findOne({ email: Email })
    if (existingUser) {
      throw new Error("A user with this email already exists")
    }

    // Create parent record
    const newParent = new Parent({
      Name,
      Email,
      Phone: phoneNumber,
      Profession,
      Address,
      photo: photo || ''
    })

    await newParent.save()

    // Create user account with parent role
    if (Email && Password) {
      const hashedPassword = await bcrypt.hash(Password, 10)
      const newUser = new User({
        name: Name,
        email: Email,
        password: hashedPassword,
        role: 'parent'
      })
      await newUser.save()
    }
  } catch (error) {
    console.log(error.message)
    throw new Error(error.message || "Failed to add parent")
  }

  revalidatePath("/parent")
  redirect("/parent")
}

export const fetchAllParents = async () => {
  try {
    connectToDB()
    const parents = await Parent.find().sort({ createdAt: -1 })
    return JSON.parse(JSON.stringify(parents))
  } catch (error) {
    console.log(error)
    return []
  }
}

export const fetchParentById = async (id) => {
  try {
    connectToDB()
    const parent = await Parent.findById(id)
    return JSON.parse(JSON.stringify(parent))
  } catch (error) {
    console.log(error)
    return null
  }
}

export const updateParent = async (formData) => {
  const { id, Name, Email, Phone, Profession, Address, photo } = Object.fromEntries(formData)

  // Parse phone - handle empty strings, whitespace, and invalid values
  let phoneNumber = undefined;
  if (Phone && typeof Phone === 'string') {
    const trimmedPhone = Phone.trim();
    if (trimmedPhone !== '') {
      const parsed = Number(trimmedPhone);
      if (!isNaN(parsed)) {
        phoneNumber = parsed;
      }
    }
  }

  const updateData = {
    Name,
    Email,
    Profession,
    Address,
    photo: photo || ''
  }

  // Only include phone in update if it's a valid number
  if (phoneNumber !== undefined) {
    updateData.Phone = phoneNumber
  }

  try {
    connectToDB()
    await Parent.findByIdAndUpdate(id, updateData)
  } catch (error) {
    console.log(error.message)
    throw new Error("Failed to update parent")
  }

  revalidatePath("/parent")
}

export const deleteParent = async (formData) => {
  const { id } = Object.fromEntries(formData)

  try {
    connectToDB()
    await Parent.findByIdAndDelete(id)
  } catch (error) {
    console.log(error)
    throw new Error("Failed to delete parent")
  }

  revalidatePath("/parent")
}

export const updateParentPassword = async (email, newPassword) => {
  try {
    connectToDB()
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    )
  } catch (error) {
    console.log(error.message)
    throw new Error("Failed to update password")
  }
}

export const fetchChildrenByParentEmail = async (email) => {
  try {
    connectToDB()
    const parent = await Parent.findOne({ Email: email })
    if (!parent) return []
    
    const { Student } = await import("@/models/student.model")
    const children = await Student.find({ Parent: parent._id })
      .populate('Class', 'name')
      .populate('section', 'name')
    
    return JSON.parse(JSON.stringify(children))
  } catch (error) {
    console.log(error)
    return []
  }
}
