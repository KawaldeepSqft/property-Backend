export const Createotp = () => {
    let length = 6
    const number = "1234567890"
    let otp = ""
    for (let index = 0; index < length; index++) {
        let i = Math.floor(Math.random() * number.length)
        otp += number.charAt(i)
    }

    return otp
}