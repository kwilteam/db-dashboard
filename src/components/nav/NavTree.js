import React from "react";
import { Scrollbars } from "react-custom-scrollbars";
import { Drawer } from "@mui/material";

import KwilDBIcon from "../../assets/logos/KwilDB.svg";
import FundingPoolList from "./FundingPoolList";
import SchemaList from "./SchemaList";
import MoatList from "./MoatList";

export default function NavTree({
  initialSchema,
  initialTable,
  initialPools,
  update,
  setUpdate,
}) {
  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={true}
      sx={{
        display: "flex",
        flexDirection: "column",
        "& .MuiDrawer-paper": {
          maxHeight: "100vh",
          maxWidth: "240px",
          borderRight: "2px solid #323232",
          background:
            "linear-gradient(260deg, rgba(113, 122, 255, .5) 0%, rgba(113, 122, 255, 0) 100%)",
          backgroundColor: "#000",
        },
      }}
    >
      <img
        src={KwilDBIcon}
        alt=""
        style={{ margin: "40px auto", width: "120px" }}
      />
      <MoatList />
      <Scrollbars
        renderView={({ style, ...props }) => (
          <div
            {...props}
            style={{ ...style, overflowX: "hidden", paddingBottom: "40px" }}
          />
        )}
        style={{ width: 240, height: "100%" }}
      >
        <SchemaList
          initialSchema={initialSchema}
          initialTable={initialTable}
          update={update}
          setUpdate={setUpdate}
        />
        <FundingPoolList initialPools={initialPools} />
      </Scrollbars>
    </Drawer>
  );
}
