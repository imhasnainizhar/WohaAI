"use client"

import { useAuth } from "@providers/auth";
import Image from "next/image";

export default function Personal() {
  const { userInfo } = useAuth()
  return (
    <div>
      <div>
        <div>
          <div>
            <i className="bx bx-arrow-back" style={{ color: "#ffffff" }}></i>
          </div>
          <div>
            <div className="">
              <div>
                <div><Image src={"/BrandLogo2.png"} alt="User Profile Picture" width={40} height={40} /></div>
                <div>
                  <span>{userInfo?.firstName}</span>
                  <span>{userInfo?.lastName}</span>
                </div>
                <div><i className="bx bx-pencil" style={{ color: '#ffffff' }}></i></div>
              </div>
              <div><div>{userInfo?.email}</div><div><i className="bx bx-pencil" style={{ color: '#ffffff' }}></i></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
