document.addEventListener("DOMContentLoaded", function() {
    var video = document.getElementById("v");
    var canvas = document.getElementById("c");
    var ctx = canvas.getContext("2d");
    
    // Khi video được play, gọi hàm detectEdges
    video.addEventListener('play', function() {
        setInterval(detectEdges, 33); // ~30 FPS
    }, false);

    function detectEdges() {
        if (video.paused || video.ended) {
            return;
        }
        
        // Đảm bảo kích thước canvas phù hợp với video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Vẽ frame hiện tại của video lên canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Lấy dữ liệu hình ảnh từ canvas
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;
        
        // Phát hiện biên cạnh bằng phương pháp Canny
        var grayData = new Uint8ClampedArray(canvas.width * canvas.height);
        for (var i = 0; i < data.length; i += 4) {
            var r = data[i];
            var g = data[i + 1];
            var b = data[i + 2];
            var gray = 0.2126 * r + 0.7152 * g + 0.0722 * b; // Chuyển đổi sang ảnh xám
            grayData[i / 4] = gray;
        }
        
        // Phát hiện biên cạnh bằng thuật toán Canny
        var edgeData = new Uint8ClampedArray(canvas.width * canvas.height);
        var threshold1 = 10; // Ngưỡng dưới
        var threshold2 = 50; // Ngưỡng trên
        for (var i = 0; i < canvas.width * canvas.height; i++) {
            edgeData[i] = 255; // Nền trắng
        }
        
        for (var y = 1; y < canvas.height - 1; y++) {
            for (var x = 1; x < canvas.width - 1; x++) {
                var offset = y * canvas.width + x;
                var sum = 0;
                sum += 2 * grayData[(y - 1) * canvas.width + x - 1];
                sum += 4 * grayData[(y - 1) * canvas.width + x];
                sum += 2 * grayData[(y - 1) * canvas.width + x + 1];
                sum += 4 * grayData[y * canvas.width + x - 1];
                sum -= 16 * grayData[y * canvas.width + x];
                sum += 4 * grayData[y * canvas.width + x + 1];
                sum += 2 * grayData[(y + 1) * canvas.width + x - 1];
                sum += 4 * grayData[(y + 1) * canvas.width + x];
                sum += 2 * grayData[(y + 1) * canvas.width + x + 1];
                var magnitude = Math.abs(sum / 16);
                if (magnitude > threshold1) {
                    edgeData[offset] = 0; // Biên cạnh
                }
            }
        }
        
        // Vẽ biên cạnh lên canvas
        var edgeImageData = ctx.createImageData(canvas.width, canvas.height);
        for (var i = 0; i < edgeData.length; i++) {
            edgeImageData.data[i * 4] = edgeData[i];
            edgeImageData.data[i * 4 + 1] = edgeData[i];
            edgeImageData.data[i * 4 + 2] = edgeData[i];
            edgeImageData.data[i * 4 + 3] = 255; // Alpha channel
        }
        ctx.putImageData(edgeImageData, 0, 0);
    }
});
