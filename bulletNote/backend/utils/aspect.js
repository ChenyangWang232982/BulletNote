
function printResult(...args) {
    const isPrint = process.env.PrintResult === "1";
    if (isPrint) { 
        console.log(...args); 
    }
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const pad = n => n.toString().padStart(2, '0');
    const pad3 = n => n.toString().padStart(3, '0'); 
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
           `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad3(date.getMilliseconds())}`;
}


exports.createAspect = (fn) => {
    //Validate parameter
    if(typeof fn !== 'function') {
        throw new Error('The element in list should be function');
    }
    const fnName = fn.name

    return async function(...args) {
        const startTime = Date.now();
        console.log(`Aspect log [${formatTime(startTime)}]: ${fnName} start to run`);
        try {
            //execute function
            const result = await fn.apply(this, args);

            //success
            const endTime = Date.now();
            console.log(`Aspect log [${formatTime(endTime)}]: ${fnName} run success, cost ${endTime - startTime}ms`);
            printResult(result);
            return result;
        } catch (error) {
            const errorTime = Date.now();
            console.error(`Aspect log [${formatTime(errorTime)}]: ${fnName} run failed`, error);
            const [, res] = args;
            if (res && typeof res.status === 'function' && typeof res.json === 'function') {
                res.status(500).json({
                    success: false,
                    message: 'Server error'
                });
        }
    }
};
}
