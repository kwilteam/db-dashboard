import React, { useEffect, useRef, useState } from "react";
import KwilDB from "kwildb";
import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Popover,
  Snackbar,
  TextField,
  Button,
  CircularProgress,
  Backdrop,
  Skeleton,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import ChainMap from "../ChainMap";
import { ethers} from "ethers";
import BigNumber from "bignumber.js";

export default function FundingPool({
  pool,
  totalFunds,
  setTotalFunds,
  setTotalData,
}) {
  const multiplier = useRef(
    pool.token === "USDC" ? 1000000 : 1000000000000000000
  );
  const decimalCheck = useRef(
    pool.token === "USDC" ? 0.000001 : 0.000000000000000001
  );
  const shift = useRef(
      pool.token === "USDC" ? 6 : 18
  );

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const [anchorEl, setAnchorEl] = useState(null);
  const [amount, setAmount] = useState(0);
  const [adding, setAdding] = useState(false);

  const [status, setStatus] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  useEffect(() => {
    setTimeout(async function () {
      const result = await KwilDB.pools.getPool(
        pool.pool_name,
        pool.blockchain,
        pool.token
      );
      console.log(result);
      setBalance(result.pool);
      setLoading(false);
    });
  }, []);

  const addFunds = () => {
    if (amount > decimalCheck.current) {
      const chainID = ChainMap().get(pool.blockchain);
      setTimeout(async function () {
        console.log(window.ethereum.networkVersion);
        console.log(chainID.int);
        if (window.ethereum.networkVersion !== chainID.int) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: chainID.hex }],
            });
          } catch (err) {
            if (err.message === "User rejected the request.") {
              //window.alert("user rejected the thing")
              return;
            }
            window.alert(
              "you do not have the specified chain added to your wallet!"
            );
            return;
          }
        }
        setAdding(true);
        await window.ethereum.send("eth_requestAccounts");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log(provider);
        const signer = provider.getSigner();
        console.log(signer);
        const address = await signer.getAddress();

        console.log(pool.pool_name);
        console.log(address);
        console.log(amount);
        console.log(pool.blockchain);
        console.log(pool.token);
        console.log(amount);
        /*console.log(multiplier.current)
        console.log(amount*multiplier.current)
        console.log(amount * Math.pow(10,18));
        console.log(parseFloat(amount))
        const number = parseFloat(amount) * Math.pow(10,18);
        console.log(number)*/
        const BN = new BigNumber(amount);
        console.log(BN.shiftedBy(shift.current).toString());


        const result = await KwilDB.pools.fundPool(
          pool.pool_name,
          address,
          pool.blockchain,
          pool.token,
            BN.shiftedBy(shift.current)
        );
        console.log(result);
        setAdding(false);
        if (typeof result === "string") {
          setStatus("fail");
          setErrMsg(result);
          // window.location.reload();
        } else {
          let newBal = parseInt(balance) + amount * multiplier.current;
          console.log(newBal);
          setBalance(newBal);
          let newTotal = parseFloat(totalFunds) + parseFloat(amount);

          setTotalFunds(newTotal);
          setTotalData(Math.round((newTotal / (8.5 * 1.3)) * 1000000000));
          setStatus("success");
          handleClose();
        }
      }, 0);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#151515",
        padding: "5px 20px",
        borderRadius: "12px",
      }}
    >
      <p style={{ color: "#fff", fontSize: "20px", fontWeight: "bold" }}>
        {pool.pool_name}
      </p>
      <p style={{ color: "#fff", margin: "6px auto 6px 0px" }}>
        <span style={{ color: "#717aff" }}>Chain: </span>
        {pool.blockchain}
      </p>
      <div style={{ display: "flex" }}>
        <p style={{ color: "#fff", margin: "6px 0px" }}>
          <span style={{ color: "#717aff" }}>Token: </span>
          {pool.token}
        </p>
        <p
          style={{
            color: "#fff",
            margin: "auto",
          }}
        >
          <span style={{ color: "#717aff" }}>Balance: </span>
          {loading ? "Loading..." : balance / multiplier.current}
        </p>
      </div>

      <p
        style={{
          color: "#fff",
          margin: "6px auto 6px 0px",
          wordBreak: "break-word",
        }}
      >
        <span style={{ color: "#717aff" }}>Validator: </span>
        {pool.validator}
      </p>
      <Button
        onClick={handleClick}
        sx={{
          display: "flex",
          color: "#ff4f99",
          textTransform: "none",
          justifyContent: "left",
          fontWeight: "bold",
          backgroundColor: "transparent !important",
          paddingLeft: 0,
        }}
        endIcon={<AddIcon />}
      >
        Add Funds
      </Button>
      <Popover
        sx={{
          borderRadius: "9px",
          "& .MuiPopover-paper": {
            backgroundColor: "#151515",
          },
        }}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            backgroundColor: "#151515",
            margin: "4px",
          }}
        >
          <TextField
            sx={{
              flex: 1,
              backgroundColor: "#212121",
              color: "#fff",
              borderRadius: "9px",
              // pl: "10px",
              minHeight: "45px",
              border: "none !important",
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none !important",
                borderRadius: "9px",
              },
              "& .MuiInputBase-root": {
                borderRadius: "9px",
                color: "#fff",
              },
            }}
            onChange={(e) => setAmount(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                addFunds();
              }
            }}
            placeholder="Amount"
            value={amount === 0 ? "" : amount}
            inputProps={{
              autoCorrect: "off",
            }}
            error={amount < decimalCheck.current}
            helperText={
              amount < decimalCheck.current
                ? `Enter an amount greater than ${decimalCheck.current} ${pool.token}`
                : ""
            }
          />

          <Button
            sx={{
              color: "#fff",
              textTransform: "none",
              margin: "0px 10px",
              borderRadius: "9px",
            }}
            onClick={addFunds}
          >
            Submit
          </Button>
        </div>
      </Popover>
      <Backdrop sx={{ display: "flex", flexDirection: "column" }} open={adding}>
        <CircularProgress sx={{ color: "#FF4F99" }} />
        <p style={{ margin: "20px auto", color: "#fff" }}>
          Please wait, this may take several minutes...
        </p>
      </Backdrop>
      <Snackbar
        sx={{ margin: "0px auto" }}
        open={status === "success"}
        autoHideDuration={4000}
        onClose={() => setStatus(null)}
      >
        <Alert
          variant="filled"
          onClose={() => setStatus(null)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Funds added succesfully to the funding pool!
        </Alert>
      </Snackbar>
      <Snackbar
        sx={{ margin: "0px auto" }}
        open={status === "fail"}
        autoHideDuration={6000}
        onClose={() => setStatus(null)}
      >
        <Alert
          variant="filled"
          onClose={() => setStatus(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          Funds not added. Reason: {errMsg};
        </Alert>
      </Snackbar>
    </div>
  );
}
