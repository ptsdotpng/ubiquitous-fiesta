/**
 * :et;tu:
 * V0.0.1
 */
//#region tmp
    // const all_terms = db
    //   .sort((a, b) => a >= b ? 1 : -1)
    //   .map(([t, d]) => {
    //     return html`
    //       <div class="term">
    //         <h3>${t.replace("_", " ")}</h3>
    //         <div class="recap">
    //           ${get_span_ctnt(db, links, cs, d)}
    //         </div>
    //       </div>
    //     `
    //   })
//#endregion
//#region utils
const html = (tmplt, ...ex) => {
  const jArr = (x) => Array.isArray(x) ? x.join("") : x;
  return tmplt.reduce((acc, p, i) => [acc, jArr(ex[i - 1]), p].join(""));
};

const hookHooks = (hooks, el) => {
  const isWired = (t, k = "e") => {
    return (Object.keys(t.dataset).length && t.dataset.hasOwnProperty(k)) 
        && (Object.keys(hooks).length     && hooks.hasOwnProperty(t.dataset[k]))
  }

  const trigger = (t, evnt, k="e") => {
    evnt.preventDefault();
    evnt.stopPropagation();
    hooks[t.dataset[k]](t, evnt);
  }

  document.querySelector(el).onmouseup = evnt => {
    const tryClick = t => {
      isWired(t) 
        ? trigger(t, evnt)
        : t.parentNode !== document ? tryClick(t.parentNode) : null;
    }
    tryClick(evnt.target)
  }

  document.ondblclick = evnt => {
    const tryClick = t => {
      isWired(t, "dbl") 
        ? trigger(t, evnt, "dbl")
        : t.parentNode !== document ? tryClick(t.parentNode) : null;
    }
    tryClick(evnt.target)
  }

  document.onkeyup = evnt => {
    const el = document.activeElement;
    if(evnt.key === "Enter" && isWired(el, "onsubmit")) {
      trigger(el, evnt, "onsubmit")
    } else if(isWired(el, "onkeyup")) {
      trigger(el, evnt, "onkeyup")
    } 
  }

  document.onkeydown = evnt => {
    const el = document.activeElement;
    if(evnt.key === "Enter" && isWired(el, "onsubmit")) {
      trigger(el, evnt, "onsubmit")
    } else if(isWired(el, "onkeydown")) {
      trigger(el, evnt, "onkeydown")
    } 
  }
};

const strToCol = (text, m = 1) => {
  let hash = [...text].reduce((h, c) => c.charCodeAt() +  ((h << 5) - h), 0)
  let c = ((hash*m) & 0x00FFFFFF).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

//#endregion
//#region helpers
const parse = (text) => {
  let [db, links] = text.split("|refs|")

  links = links.trim().split("\n")
    .map(l => l.split(";"))

  db = db.trim().split("#")
    .filter(t => t !== "")
    .map(t => {
      // uuuuuuugly
      const [h, ...r] = t.split("\n")
      return [h.trim(), r.join("\n")]
    })
  return [db, links]
}


const color_scheme = () => {
  //init css node
  const el = document.createElement("style");
  document.getElementsByTagName("head")[0].appendChild(el);

  const state = {};

  return (term = null) => {
    //workaround - get state when 
    if(term === null) return state;
    if(!state.hasOwnProperty(term)) {
      state[term] = [strToCol(term), strToCol(term, -1)];
      el.innerText += `
        .d-${term} {
          background-color: ${state[term][0]}; 
          color: ${state[term][1]};
        }
      `
    }
  };
};

const get_node_term = el => el.className.split(" ")[1].substring(2);
const to_search = (str) => str.indexOf(";") === -1 ? [str, str] : str.split(";");
//#endregion
//#region components
const get_span_term = (d, t) => {
  return html`
    <span id="s${uuid()}" class="def d-${t}"><span class="link" data-e="open">${d}</span><span class="content"></span></span>
  `.trim();
};

const get_span_ctnt_edit = (text) => {
  return html`<span data-onsubmit="onEdit" contenteditable="true">${text}</span>`
}

const get_span_ctnt_new = () => { 
  return get_span_ctnt_edit(`no entry yet`)
};

const get_span_ctnt = (d, l, cs, txt) => {
  const replDef = (full, _, val, ...rest) => {
    let [d, t] = to_search(val)
    cs(t);
    return get_span_term(d, t)
  }

  const replLink = (full, _, val, ...rest) => {
    let [d, ln] = to_search(val)
    let [,link] = l.find(([n]) => ln === n) || ["", ""]
    
    return html`<a href="http://${link}">${d}</a>`
  }
  
  const render = t => {
    return t
      .replace(/(:)(.*?)\1/g, replDef)
      .replace(/(\|)(.*?)\1/g, replLink)
  }
  return render(txt)
};

const render_open_node = (id, t, db, links, cs) => {
  const trgt = document.querySelector(`#${id} > span.content`);
  const n = document.querySelector(`#${id}`)

  // if(trgt.innerHTML != "") return;
  const term = get_node_term(n);
  const dd = db.find(([id]) => term === id )  

  if(dd === undefined) {
    trgt.innerHTML = html`${closeBtn(id)}${get_span_ctnt_new()}${closeBtn(id)}`
  } else {
    const ctnt = get_span_ctnt(db, links, cs, dd[1]);
    trgt.innerHTML = html`${closeBtn(id)}<span data-dbl="toEdit">${ctnt}</span>${closeBtn(id)}`
  }
};

const closeBtn = (id) => {
  return html`<span class="close" data-e="close" data-id="${id}">&#10006;</span>`
};
//#endregion


const ettu = (el, text) => {
  const [db, links] = parse(text)
  const cs = color_scheme();

  // #region events
  const openNode = (t, e) => {
    const id = t.parentNode.id;
    render_open_node(id, t, db, links, cs)
  }

  const closeNode = e => {
    document.querySelector(`#${e.dataset.id} > span.content`).innerHTML = "";
  };

  const toggleEdit = (t, e) => {

    const id = t.parentNode.parentNode.id
    const trgt = document.querySelector(`#${id} > span.content`);
    const n = document.querySelector(`#${id}`)
  
    // if(trgt.innerHTML != "") return;
    const term = get_node_term(n);
    const dd = db.find(([id]) => term === id )  
  
    trgt.innerHTML = html`${closeBtn(id)}${get_span_ctnt_edit(dd[1])}${closeBtn(id)}`
    // get_span_ctnt_edit()
  }

  const editNode = (t, e) => {
    if(e.key === "Enter") {
      console.log(t, e)
      e.preventDefault()
      const wrapper_el = t.parentNode.parentNode
      const new_entry = [
        get_node_term(wrapper_el),
        t.innerHTML
      ];
      db.push(new_entry);
      const id = t.parentNode.parentNode.id;
      console.log(id)
      render_open_node(id, t, db, links, cs)
    }
  };
  
  const init = () => {
    el.innerHTML = html`${get_span_ctnt(db, links, cs, db[0][1])}`;

    hookHooks({
      open: openNode,
      close: closeNode,
      onEdit: editNode,
      toEdit: toggleEdit
    }, "body");
  };
  // #endregion

  init();
};

export {ettu}