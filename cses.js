const IP = `http://bogodijkstra.xyz:5001`

const id_list = [102879, 144352, 143392, 138829, 138667, 144349, 143605, 145408, 144447, 144354, 144353, 49521, 135064];


// Row component
const rowComponent = (username, solved) => {
    return `
    <tr>
        <td class="text-white py-3 px-6">${username}</td>
        <td class="text-white py-3 px-6">${solved}</td>
    <tr>

    `
}

const getSolved = async (user_id) => {
    const url = `${IP}/proxyapi/${user_id}`;

    // get html from user
    const response = await fetch(url);
    const plain_html = await response.text();

    // parse it
    const parser = new DOMParser();
    const doc = parser.parseFromString(plain_html, "text/html");

    // scrapping
    const all_solved_dom = doc.getElementsByClassName("task-score icon");
    const username = doc.getElementsByClassName("content")[0].childNodes[2].textContent.trim().slice(15);
    const solved_count = doc.getElementsByClassName("content")[0].childNodes[4].textContent.trim().slice(14).split("/")[0]
    // return all exercises in order
    let all_solved = [];
    for (let exercise of all_solved_dom) {
        all_solved.push({
            problem_name: exercise.getAttribute("title"),
            solved_tasks: exercise.classList.contains("full")
        });
    }

    return {
        username,
        solved_count,
        all_solved
    };
};

let all_user_data = []
Promise.all(
    id_list.map( async (user_id) => {
        const user_data = await getSolved(user_id);
        all_user_data.push(user_data);
    })
).then( () => {

    all_user_data.sort( (a, b)  => {
        return b.solved_count - a.solved_count;
    })

    for (const user of all_user_data)
        document.getElementById("solved-insert").innerHTML += rowComponent(user.username, user.solved_count);
});
