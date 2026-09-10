import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },

                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });

                    response = NextResponse.next({
                        request,
                    });

                    cookiesToSet.forEach(
                        ({ name, value, options }) => {
                            response.cookies.set(
                                name,
                                value,
                                options
                            );
                        }
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Not logged in
    if (!user) {
        return NextResponse.redirect(
            new URL("/auth/login", request.url)
        );
    }

    // Get role using the existing secure database function
    const { data: role, error: roleError } =
        await supabase.rpc("get_current_user_role");

    if (roleError) {
        console.error("ROLE RPC ERROR:", roleError);

        return new NextResponse(
            `Role RPC Error: ${roleError.message}`,
            {
                status: 403,
            }
        );
    }

    if (!role) {
        console.error("ROLE IS EMPTY");

        return new NextResponse(
            "Role check failed: No role found",
            {
                status: 403,
            }
        );
    }

    console.log("========== JANARAKSHA PROXY ==========");
    console.log("USER:", user.email);
    console.log("ROLE:", role);
    console.log("ROLE TYPE:", typeof role);
    console.log("ROLE JSON:", JSON.stringify(role));
    console.log("PATH:", request.nextUrl.pathname);
    console.log("======================================");

    const pathname = request.nextUrl.pathname;

    const isUserRoute =
        pathname === "/user" ||
        pathname.startsWith("/user/");

    const isAuthorityRoute =
        pathname === "/authority" ||
        pathname.startsWith("/authority/");

    // USER module → only USER role
    if (isUserRoute && role !== "USER") {
        return new NextResponse("Access Denied", {
            status: 403,
        });
    }

    // AUTHORITY module → only AUTHORITY role
    if (
        isAuthorityRoute &&
        role !== "AUTHORITY"
    ) {
        return new NextResponse("Access Denied", {
            status: 403,
        });
    }

    return response;
}