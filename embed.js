const params = new URLSearchParams(window.location.search);
const choice = params.get("choice");
const iframe = document.getElementById('frame');
if (choice == 1) {
    iframe.src = 'https://nettleweb.com';
} else if (choice == 2) {
    iframe.src = 'https://sigmasigmatoiletedge.github.io';
} else if (choice == 3) {
    iframe.src = 'https://resent4-0.vercel.app/';
} else if (choice == 4) {
    iframe.src = 'https://dfs3rzq44v6as.cloudfront.net/place/';
} else {
    iframe.style.display = 'none';
    showError('You Must Select An Embed First');
}