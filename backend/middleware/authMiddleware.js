import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("👉 1. Auth Header received:", authHeader); // Yeh check karega ki token frontend se aaya ya nahi

    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, 'hotelpro_super_secret_key_123');
            console.log("👉 2. Decoded Token Data:", decoded); // Yeh check karega ki token ke andar kya data hai (isAdmin true hai ya nahi)

            req.user = decoded;
            next();
        } catch (error) {
            console.error("❌ 3. JWT Verify Error:", error.message); // Agar token galat ya expired hai toh yahan error aayega
            res.status(401).json({ message: "Not authorized, invalid token" });
        }
    } else {
        console.log("❌ 4. No token found in headers!");
        res.status(401).json({ message: "Not authorized, no token provided" });
    }
};

export const admin = (req, res, next) => {
    console.log("👉 5. Checking Admin Role, user is:", req.user); // Yeh check karega ki user admin hai ya nahi
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        console.log("❌ 6. User is NOT an admin!");
        res.status(401).json({ message: "Not authorized as an admin" });
    }
};