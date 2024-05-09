const access = (permittedPermissions) => {
    return (req, res, next) => {
        // Check if any of the permittedPermissions are included in the user's permissions
        const authorized = permittedPermissions.some(perm => req.permissions.includes(perm));

        if (authorized) {
            next();
        } else {
            res.json({ msg: "You are not authorized" });
        }
    };
};

module.exports = {
    access
};
