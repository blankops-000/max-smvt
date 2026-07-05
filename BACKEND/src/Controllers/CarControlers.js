import { getCarsTable, supabaseRequest } from "../config/supabase.js";

const table = getCarsTable();

const toClientCar = (row) => ({
  _id: row.id,
  id: row.id,
  title: row.title,
  brand: row.brand,
  model: row.model,
  year: row.year,
  price: Number(row.price),
  mileage: row.mileage,
  fuelType: row.fuel_type,
  transmission: row.transmission,
  color: row.color,
  images: row.images || [],
  condition: row.condition,
  contactNumber: row.contact_number,
  isAvailable: row.is_available,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toSupabaseCar = (body) => ({
  title: body.title,
  brand: body.brand,
  model: body.model,
  year: Number(body.year),
  price: Number(body.price),
  mileage: Number(body.mileage),
  fuel_type: body.fuelType,
  transmission: body.transmission,
  color: body.color,
  images: Array.isArray(body.images) ? body.images : [],
  condition: body.condition,
  contact_number: body.contactNumber,
  is_available: body.isAvailable ?? true,
});

const validateCar = (car) => {
  const requiredFields = [
    "title",
    "brand",
    "model",
    "year",
    "price",
    "mileage",
    "fuel_type",
    "transmission",
    "color",
    "condition",
    "contact_number",
  ];

  const missingField = requiredFields.find((field) => car[field] === undefined || car[field] === "" || Number.isNaN(car[field]));

  if (missingField) {
    const error = new Error(`Missing or invalid field: ${missingField}`);
    error.status = 400;
    throw error;
  }
};

const sendError = (res, error, fallbackStatus = 500) => {
  const status = error.status || fallbackStatus;
  res.status(status).json({ message: error.message });
};

export async function getCar(req, res) {
  try {
    const cars = await supabaseRequest(`${table}?select=*&order=created_at.desc`);
    res.status(200).json(cars.map(toClientCar));
  } catch (error) {
    console.error("Supabase fetch error:", error);
    sendError(res, error);
  }
}

export async function postCar(req, res) {
  try {
    const car = toSupabaseCar(req.body || {});
    validateCar(car);

    const savedCars = await supabaseRequest(table, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(car),
    });

    res.status(201).json(toClientCar(savedCars[0]));
  } catch (error) {
    sendError(res, error, 400);
  }
}

export async function updateCar(req, res) {
  try {
    const { id } = req.params;
    const car = toSupabaseCar(req.body || {});
    validateCar(car);

    const updatedCars = await supabaseRequest(`${table}?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(car),
    });

    if (!updatedCars.length) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json(toClientCar(updatedCars[0]));
  } catch (error) {
    sendError(res, error, 400);
  }
}

export async function deleteCar(req, res) {
  try {
    const { id } = req.params;
    const deletedCars = await supabaseRequest(`${table}?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        Prefer: "return=representation",
      },
    });

    if (!deletedCars.length) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    sendError(res, error);
  }
}
