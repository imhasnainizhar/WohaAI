import { NextResponse } from "next/server";
import { useParams } from "next/navigation";


export const mockUsers = [
    {
        id: "u_001",
        firstName: "Hani",
        lastName: "Izhar",
        username: "haniizhar",
        email: "hani@test.dev",
        avatar: "https://i.pravatar.cc/150?img=3",
        createdAt: "2025-01-12T10:15:00Z",
    },
    {
        id: "u_002",
        firstName: "Alex",
        lastName: "Smith",
        username: "alexsmith",
        email: "alex@test.dev",
        avatar: "https://i.pravatar.cc/150?img=5",
        createdAt: "2025-02-01T14:20:00Z",
    },
];



export async function GET(_: Request) {
    const { id } = useParams();
    const user = mockUsers.find((u: any) => u.id === id);

    if (!user) {
        return NextResponse.json(
            { success: false, message: "User not found" },
            { status: 404 }
        );
    }

    return NextResponse.json({
        success: true,
        user,
    });
}
