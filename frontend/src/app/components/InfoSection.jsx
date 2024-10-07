"use client"
import React,{useState, useEffect} from 'react'
import {Card, CardHeader, CardBody, CardFooter, Divider, Link, Image, Button} from "@nextui-org/react";
import axios from 'axios'
import { FaLock } from "react-icons/fa";


function InfoSection() {
  
  const[isOn, setIsOn] = useState(false);
  const [amounts, setAmounts] = useState({
    // bscAmount: 0,
    polAmount: 0,
    usdtAmount:0,
    polAmountL:0
  });
   
  const StartSocket = async() =>{
      try{
        const response = await axios.get('http://localhost:8000/start-websocket')
        if (response.status === 200) {
          window.alert("Security mode on");
          setIsOn(true);
        }
      }
      catch(error){
        console.log(error)
      }
  }
  const CloseSocket = async() =>{
    try{
      const response = await axios.get('http://localhost:8000/close-websocket')
      if (response.status === 200) {
        window.alert("Security mode of");
        setIsOn(false)
      }
      
    }
    catch(error){
      console.log(error)
    }
}
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/fetch-balances`);
        setAmounts({
          // bscAmount: response.data.bnbBalance,
          polAmount: response.data[0].polBalance, // balances is at index 0
          usdtAmount: response.data[0].usdtBalance,
          polAmountL: response.data[1].polBalance // balancesL is at index 1
        });
        console.log(polAmount)

      } catch (error) {
        console.error('Error fetching balances:', error);
      }
    };

    fetchBalances();
    const intervalId = setInterval(fetchBalances, 1000);
    return () => clearInterval(intervalId);
  }, []);
  return (
    <>

    <Card className="mt-24 bg-slate-100 lg:w-[1050px] sm:w-[580px]">
    <CardHeader className="flex justify-between items-center gap-3">
      <div className="flex flex-col">
        <p className="text-2xl text-gray-600 bold">Account Information</p>
      </div>
      <div>
      {
        isOn? (
          <Button radius="full" className="bg-gradient-to-tr from-red-700 to-orange-500 text-white shadow-lg" onClick={CloseSocket}>
            Turn Of Security
          </Button> 
        ):(
          <Button radius="full" className="bg-gradient-to-tr from-green-700 to-teal-500 text-white shadow-lg" onClick={StartSocket}>
             Turn On Security
          </Button>
        )
      }
       
      </div>
    </CardHeader>

      <Divider/>
      <CardBody>
         <p className="flex gap-2 text-md">Wallet Address: <span className="text-blue-500 ml-2">0x0034B0e1bA467744296d676B597470266803C1c8</span></p>
      </CardBody>
      <Divider/>

      <CardBody>
       <p className="flex gap-2 text-md">Matic Amount: <span className="text-blue-500 ml-2">{amounts.polAmount}</span></p>
      </CardBody>
      <CardBody>
       <p className="flex gap-2 text-md">Usdt Amount: <span className="text-blue-500 ml-2">{amounts.usdtAmount}</span></p>
      </CardBody>
      <CardBody>
      <p className="flex items-center gap-2 text-md">
        Locked Amount:
        <span className="text-blue-500 ml-2">{amounts.polAmountL}</span>
        {isOn ? <FaLock className="" /> : null}

      </p>
      </CardBody>
 
    </Card>
    </>
  )
}

export default InfoSection