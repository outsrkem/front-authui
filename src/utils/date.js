// 时间格式过滤器
export function formatTime(value, format = "YYYY-MM-DD HH:mm:ss") {
    // 处理无效时间戳
    if (value === null || value === "" || value === undefined || value <= 0) {
        return "--";
    }

    // 处理秒级时间戳（如果小于1e12，视为秒级，转为毫秒级）
    if (value < 1e12) {
        value = value * 1000;
    }

    const date = new Date(value);

    // 获取时间各部分值
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份从0开始
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // 补零函数
    const padZero = (num) => (num < 10 ? "0" + num : num);

    // 替换格式字符串中的占位符
    return (
        format
            .replace("YYYY", year)
            .replace("MM", padZero(month))
            .replace("DD", padZero(day))
            .replace("HH", padZero(hours))
            .replace("mm", padZero(minutes))
            .replace("ss", padZero(seconds))
            // 支持短格式
            .replace("YY", String(year).slice(2))
            .replace("M", month)
            .replace("D", day)
            .replace("H", hours)
            .replace("m", minutes)
            .replace("s", seconds)
    );
}

// 毫秒级时间戳
// console.log(formatTime(1620000000000, "YYYY-MM-DD")); // 2021-05-03
// console.log(formatTime(1620000000000, "MM/DD/YY")); // 05/03/21
// console.log(formatTime(1620000000000, "HH:mm:ss")); // 10:40:00
// console.log(formatTime(1620000000000, "YYYY年MM月DD日 HH时mm分ss秒")); // 2021年05月03日 10时40分00秒

export function getTimeDiff(futureTimestamp) {
    const now = new Date();
    const future = new Date(futureTimestamp);

    // 处理未来时间已过去的情况
    if (future <= now) return "0秒";

    // 计算年差
    let years = future.getFullYear() - now.getFullYear();
    let months = future.getMonth() - now.getMonth();
    let days = future.getDate() - now.getDate();
    let hours = future.getHours() - now.getHours();
    let minutes = future.getMinutes() - now.getMinutes();
    let seconds = future.getSeconds() - now.getSeconds();

    // 处理借位
    if (seconds < 0) {
        seconds += 60;
        minutes--;
    }
    if (minutes < 0) {
        minutes += 60;
        hours--;
    }
    if (hours < 0) {
        hours += 24;
        days--;
    }
    if (days < 0) {
        // 获取前一个月的天数
        const prevMonth = new Date(future.getFullYear(), future.getMonth(), 0).getDate();
        days += prevMonth;
        months--;
    }
    if (months < 0) {
        months += 12;
        years--;
    }

    // 拼接结果，只包含非零部分
    const parts = [];
    if (years > 0) parts.push(`${years}年`);
    if (months > 0) parts.push(`${months}月`);
    if (days > 0) parts.push(`${days}天`);

    // 当天/月/年存在时，即使小时为0也显示
    if (hours > 0 || days > 0 || months > 0 || years > 0) {
        parts.push(`${hours}时`);
    }

    // 始终显示分秒
    parts.push(`${minutes}分`);
    parts.push(`${seconds}秒`);

    return parts.join("");
}

// 示例测试
// console.log(getTimeDiff(Date.now() + 30 * 60 * 1000)); // 30分0秒（小于1小时）
// console.log(getTimeDiff(Date.now() + 90 * 60 * 1000)); // 1时30分0秒（1-24小时）
// console.log(getTimeDiff(Date.now() + 25 * 60 * 60 * 1000)); // 1天1时0分0秒（超过24小时）
// console.log(getTimeDiff(Date.now() + 32 * 24 * 60 * 60 * 1000)); // 1月2天0时0分0秒（超过1个月）
