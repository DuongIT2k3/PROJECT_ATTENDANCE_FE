
export const translateRoles = (role: string) => {
    switch(role) {
        case "student": 
            return "Học sinh";
        case "teacher":
            return "Giảng viên";
        case "superAdmin":
            return "Quản trị viên";
        default:
            break;
    }
};

export const getColorByRole = (role: string) => {
    switch(role) {
        case "student":
            return "cyan";
        case "teacher":
            return "blue";
        case "superAdmin":
            return "purple";
        default: 
         return "#CFD8DC"
    }
};