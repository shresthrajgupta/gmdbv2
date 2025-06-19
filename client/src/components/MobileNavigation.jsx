import { MobileNav } from "../constants/Navigation";
import { NavLink } from "react-router-dom";


const MobileNavigation = () => {
    return (
        <section className='bg-black h-14 w-full fixed bottom-0 bg-opacity-60 backdrop-blur-sm lg:hidden z-40'>
            <div className='flex items-center justify-between h-full text-neutral-500'>
                {
                    MobileNav.map((nav, index) => {
                        return (
                            <NavLink
                                key={nav.label + "mobilenavigation"}
                                className={({ isActive }) => `px-3 flex h-full items-center flex-col justify-center ${isActive && "text-white"}`}
                                to={nav.href}
                            >
                                <div className='text-2xl'>
                                    {nav.icon}
                                </div>
                                <p className='text-sm'> {nav.label} </p>
                            </NavLink>
                        )
                    })
                }
            </div>
        </section>
    );
};

export default MobileNavigation;