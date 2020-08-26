export const simSelectAndCycle = (title, length) => { 
    // For manipulate data simulation selector 
    var elem = document.createElement('option')
    var elemText = document.createTextNode(title + " with " + length + " cycle(s)")
    elem.appendChild(elemText)
    var foo = document.getElementById("sim-select")
    foo.appendChild(elem)
    // Change to the most recent option
    foo.selectedIndex = foo.options.length-1

    // For download data simulation selector
    // The next 3 lines are needed for some reason
    elem = document.createElement('option')
    elemText = document.createTextNode(title + " with " + length + " cycles")
    elem.appendChild(elemText)
    var bar = document.getElementById("sim-download")
    bar.appendChild(elem)
    bar.selectedIndex = bar.options.length-1

    // For simulaton cycle selector 
    document.getElementById("cycle").setAttribute("max", length);
    document.querySelector(".cycle-output").textContent = 0;
    document.getElementById("cycle").value = 0
}