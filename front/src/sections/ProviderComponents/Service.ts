export interface Service {
  id: number
  customerName: string
  serviceName: string
  date: string
  time: string
  location: string
  price: number
  distanceCharge: number
  total: number
  image: string
  createdAt: string
  autoCancelDate: string
  status: "pending" | "ongoing" | "completed" | "cancelled"
  completedDate?: string
  workersRequired?: number
  workersAssigned?: number
}