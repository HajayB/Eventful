export const cookieOptions = {
    httpOnly:true,
    secure:false, //set to true in production
    sameSite:"lax", //set to strict in production
    path:"/",
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
};

