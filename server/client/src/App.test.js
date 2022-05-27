
import { Login} from "./pages/Login"
import {render, screen} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import '@testing-library/jest-dom'
//TODO
//still in development
test("renders login",async()=>{
   render(<Login/>);
   const usernameEl = screen.getByPlaceholderText(/username/i)
   const passwordEl = screen.getByPlaceholderText(/password/i)
   const buttonItems = screen.getAllByRole("button")

   expect(buttonItems).toHaveLength(2)
   expect(usernameEl).toBeInTheDocument();
   expect(passwordEl).toBeInTheDocument();

    userEvent.type(usernameEl,"test")
    userEvent.type(passwordEl,"test")

   expect(usernameEl.value).toBe("test")

})
//TODO