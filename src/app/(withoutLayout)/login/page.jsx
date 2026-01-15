
import { redirect } from "next/navigation";
import { isUserLoggedIn } from "@/actions/authActions";

const { default: Login } = require("@/screens/login");

const LoginPage = ({ searchParams }) => {
if(isUserLoggedIn().value){
  
  redirect("/");
}
  return (
    <>
      <Login searchParams={searchParams} />
    </>
  );
};

export default LoginPage;
