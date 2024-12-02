import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaCalendarAlt } from "react-icons/fa";

// Styled components for the reservation form
const Container = styled.div`
  background-color: #121212;
  color: #e0e0e0;
  padding: 20px;
  min-height: 100vh;
  font-family: "Roboto", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FormTitle = styled.h2`
  color: white;
  margin-bottom: 20px;
`;

const Form = styled.form`
  width: 100%;
  max-width: 600px;
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 1.1em;
  margin-bottom: 5px;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  background-color: #2e2e2e;
  color: white;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #0d47a1;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background-color: #1565c0;
  }
`;

const CarDetails = styled.div`
  margin-bottom: 20px;
  text-align: center;
`;

const CarImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 10px;
`;

const ErrorMessage = styled.p`
  color: red;
  text-align: center;
`;

const ReserveNow = () => {
  const { carId, userId } = useParams(); // Fetch carId and userId from the URL params
  const navigate = useNavigate();

  const [car, setCar] = useState({});
  const [pickupDate, setPickupDate] = useState("");
  const [dropOffDate, setDropOffDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch car details based on carId
  useEffect(() => {
    if (!carId) {
      setErrorMessage("Car ID is missing");
      return; // Stop further execution if carId is missing
    }

    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`https://localhost:7173/api/Car/${carId}`);
        console.log("Response Status:", response.status);  // Log response status
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched car details:", data); // Log car details

        if (!data.name || !data.pricePerDay) {
          setErrorMessage("Car data is incomplete.");
          return;
        }

        setCar(data);
        setTotalPrice(data.pricePerDay); // Set price based on the car's price per day
      } catch (error) {
        setErrorMessage("Error fetching car details.");
        console.error("Error fetching car details:", error.message);
      }
    };

    fetchCarDetails();
  }, [carId]);

  // Calculate the total price based on dates
  useEffect(() => {
    if (pickupDate && dropOffDate) {
      const pickup = new Date(pickupDate);
      const dropOff = new Date(dropOffDate);

      if (dropOff < pickup) {
        setErrorMessage("Drop-off date cannot be earlier than pickup date.");
        setDropOffDate(""); // Reset dropOffDate
        setTotalPrice(0); // Reset totalPrice
        return;
      }

      const timeDifference = dropOff - pickup;
      const days = timeDifference / (1000 * 3600 * 24); // Convert milliseconds to days
      if (days > 0) {
        setTotalPrice(days * car.pricePerDay); // Calculate total price
      } else {
        setTotalPrice(0);
      }
    }
  }, [pickupDate, dropOffDate, car.pricePerDay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickupDate || !dropOffDate || totalPrice <= 0) {
      setErrorMessage("Please provide valid dates and ensure the total price is greater than 0.");
      return;
    }

    const reservationData = {
      userId: parseInt(userId), // Ensure userId is a number
      carId: parseInt(carId),   // Ensure carId is a number
      pickupDate: pickupDate,
      dropOffDate: dropOffDate,
      totalPrice: totalPrice,
      reservationStatus: "Confirmed", // You can adjust this based on your needs
    };

    try {
      const response = await fetch("https://localhost:7173/api/Reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        throw new Error("Reservation failed");
      }

      const result = await response.json();
      alert("Reservation confirmed!");
      navigate("/UserProfile"); // Redirect to reservations page after successful reservation
    } catch (error) {
      alert("An error occurred while making the reservation.");
      console.error(error);
    }
  };

  return (
    <Container>
      <FormTitle>Reserve {car.name}</FormTitle>

      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      <CarDetails>
        <CarImage
          src={car.imageUrl || "https://via.placeholder.com/600x300?text=No+Image+Available"}
          alt={car.name}
        />
        <h3>{car.name}</h3>
        <p>₹{car.pricePerDay}/day</p>
      </CarDetails>

      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="pickupDate">
            <FaCalendarAlt /> Pickup Date
          </Label>
          <Input
            type="date"
            id="pickupDate"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="dropOffDate">
            <FaCalendarAlt /> Drop-off Date
          </Label>
          <Input
            type="date"
            id="dropOffDate"
            value={dropOffDate}
            onChange={(e) => setDropOffDate(e.target.value)}
            required
          />
        </InputGroup>

        <InputGroup>
          <Label>Total Price</Label>
          <Input type="text" value={`₹${totalPrice}`} disabled />
        </InputGroup>

        <Button type="submit">Confirm Reservation</Button>
      </Form>
    </Container>
  );
};

export default ReserveNow;