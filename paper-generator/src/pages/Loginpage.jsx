import React from "react";
import { Box, Typography } from "@mui/material";

const IPhone14ProMax6 = () => {
  return (
    <Box className="w-full h-[932px] relative shadow-[0px_4px_79px_rgba(120,_146,_146,_0.99)] rounded-[33px] bg-[#fff] overflow-hidden text-left text-base text-[#303030] font-[Inter]">
      
      {/* Title */}
      <div className="absolute top-[60px] left-[20px] text-2xl tracking-[0.01em] font-medium text-[#000]">
        Login Account
      </div>

      {/* Profile */}
      <img
        className="absolute top-[51px] left-[349px] rounded-[50%] w-9 h-9 object-cover"
        alt="Profile"
        src="/Ellipse-29@2x.png"
      />
      <img
        className="absolute top-[59px] left-[390px] w-5 h-5"
        alt="Dropdown"
        src="/arrow-drop-down.svg"
      />

      {/* Welcome text */}
      <div className="absolute top-[93px] left-[20px] tracking-[0.01em] font-medium text-[#969696]">
        Hello, Welcome back to your account.
      </div>

      {/* Input placeholders */}
      <Box className="absolute top-[153px] left-[20px] rounded-[100px] bg-[#f5f5f5] w-[390px] h-14" />
      <Box className="absolute top-[625px] left-[20px] shadow-[0px_4px_4px_rgba(0,_0,_0,_0.13)] rounded-[100px] bg-[#f5f5f5] w-[390px] h-14" />
      <Box className="absolute top-[335px] left-[20px] rounded-[100px] border-[#c2c2c2] border-solid border-[1px] box-border w-[390px] h-14" />

      {/* Small white shadow box */}
      <Box className="absolute top-[158px] left-[216px] shadow-[0px_4px_42px_rgba(0,_0,_0,_0.23)] rounded-[100px] bg-[#fff] w-[188px] h-[46px]" />

      {/* Labels */}
      <div className="absolute top-[175px] left-[104px] tracking-[0.01em] font-medium text-[#969696]">
        Email
      </div>
      <div className="absolute top-[357px] left-[125px] tracking-[0.01em] font-medium">
        +8801756500553
      </div>

      {/* Request OTP button */}
      <Box className="absolute top-[434px] left-[20px] rounded-[100px] bg-[#789292] overflow-hidden flex items-start pt-[22px] pb-[22px] px-[142px] text-[#fff] shadow-md hover:bg-[#607b7b] cursor-pointer transition-all duration-300">
        <Typography
          className="relative"
          sx={{ letterSpacing: "0.01em", fontWeight: "700" }}
        >
          Request OTP
        </Typography>
      </Box>

      {/* Other small texts */}
      <div className="absolute top-[175px] left-[270px] tracking-[0.01em] font-medium text-[#454545]">
        Phone no..
      </div>
      <div className="absolute top-[299px] left-[35px] tracking-[0.01em] font-medium">
        Phone no..
      </div>
      <div className="absolute top-[551px] left-[142px] tracking-[0.01em] font-medium">
        Sign in with Google
      </div>

      {/* Footer */}
      <div className="absolute top-[724px] left-[20px] tracking-[0.01em]">
        <Typography sx={{ fontWeight: "500" }} component="span">
          No registered yet?{" "}
        </Typography>
        <Typography className="text-[#ffa393]" component="b">
          Create an account
        </Typography>
      </div>

      <div className="absolute top-[647px] left-[188px] tracking-[0.01em] font-medium">
        Google
      </div>

      {/* Decoration elements */}
      <Box className="absolute top-[334.5px] left-[98.5px] border-[#c2c2c2] border-solid border-r-[1px] box-border w-px h-[57px]" />
      <Box className="absolute top-[348px] left-[38px] rounded-[50%] bg-[#0a7347] w-[30px] h-[30px]" />
      <Box className="absolute top-[352px] left-[367px] rounded-[50%] bg-[#8ce4a4] w-[22px] h-[22px]" />
      <Box className="absolute top-[356px] left-[46px] rounded-[50%] bg-[#ff0000] w-3.5 h-3.5" />
      <Box className="absolute top-[559.5px] left-[-0.5px] border-[#c2c2c2] border-solid border-t-[1px] box-border w-[132px] h-px" />
      <Box className="absolute top-[559.5px] left-[298.5px] border-[#c2c2c2] border-solid border-t-[1px] box-border w-[132px] h-px" />

      {/* Bottom line */}
      <img
        className="absolute top-[890.5px] left-[117px] max-h-full w-[182px]"
        alt="line"
        src="./src/images/Line-12.svg"
      />
    </Box>
  );
};

export default IPhone14ProMax6;
