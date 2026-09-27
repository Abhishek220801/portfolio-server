import "dotenv/config"
import express, { type Request, type Response } from "express"
import cors from "cors"
import nodemailer from "nodemailer"
import axios from "axios"

const app = express()

const PORT = process.env.PORT ?? 8080;

app.use(cors({
    origin: "http://localhost:5173"
}))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_APP_PASSWORD as string,
  },
})

app.post("/api/contact", async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "All fields are required.",
      })
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `Portfolio enquiry from ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
    })

    res.status(200).json({
      message: "Message sent successfully.",
    })
  } catch (error: any) {
    if(axios.isAxiosError(error)){
        console.error(error.response?.data?.message)
    }
    if(error instanceof Error) {
        console.error(error.message)
    }
    console.error(error);
    res.status(500).json({
      message: "Failed to send message.",
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})