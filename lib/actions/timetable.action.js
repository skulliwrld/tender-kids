"use server"

import { connectToDB } from "../Database/connectToDB"
import { Timetable } from "@/models/timetable.model"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export const createTimetable = async (formData) => {
  const classId = formData.get("Class")
  const day = formData.get("day")
  
  const periods = []
  for (let i = 1; i <= 3; i++) {
    periods.push({
      subject: formData.get(`subject${i}`),
      startTime: formData.get(`startTime${i}`),
      endTime: formData.get(`endTime${i}`),
      startPeriod: formData.get(`startPeriod${i}`),
      endPeriod: formData.get(`endPeriod${i}`)
    })
  }

  try {
    connectToDB()
    
    const existingTimetable = await Timetable.findOne({ Class: classId, day })
    
    if (existingTimetable) {
      existingTimetable.periods = periods
      await existingTimetable.save()
    } else {
      const newTimetable = new Timetable({
        Class: classId,
        day,
        periods
      })
      await newTimetable.save()
    }
  } catch (error) {
    console.log(error.message)
    throw new Error("Failed to create timetable")
  }

  revalidatePath("/timetable")
  redirect("/timetable")
}

export const fetchTimetableByClass = async (classId) => {
  try {
    connectToDB()
    const timetable = await Timetable.find({ Class: classId })
      .populate("Class", "name numericId")
      .populate("periods.subject", "Name")
      .sort({ day: 1 })
    
    return JSON.parse(JSON.stringify(timetable))
  } catch (error) {
    console.log(error)
    return []
  }
}

export const fetchAllTimetables = async () => {
  try {
    connectToDB()
    const timetables = await Timetable.find()
      .populate("Class", "name numericId")
      .populate("periods.subject", "Name")
      .sort({ "Class.name": 1, day: 1 })
    
    return JSON.parse(JSON.stringify(timetables))
  } catch (error) {
    console.log(error)
    return []
  }
}

export const fetchTimetableByDay = async (classId, day) => {
  try {
    connectToDB()
    const timetable = await Timetable.findOne({ Class: classId, day })
      .populate("Class", "name numericId")
      .populate("periods.subject", "Name")
    
    return JSON.parse(JSON.stringify(timetable))
  } catch (error) {
    console.log(error)
    return null
  }
}

export const deleteTimetable = async (id) => {
  try {
    connectToDB()
    await Timetable.findByIdAndDelete(id)
    revalidatePath("/timetable")
  } catch (error) {
    console.log(error)
    throw new Error("Failed to delete timetable")
  }
}

export const getClassesWithTimetable = async () => {
  try {
    connectToDB()
    const timetables = await Timetable.distinct("Class")
    return timetables
  } catch (error) {
    console.log(error)
    return []
  }
}
