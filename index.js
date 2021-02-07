const DATA = [
    [`welcome`, `
    welcome to my about page<br/>
    <br/>
    a lot of things are currently under construction. i have big :plans;about_page: for this little page. but like most side projects, we can expect these plans to change pretty frequently
    <br/>
    <br/>
    and it's all going to streamed. cause we're streaming about :streaming:. and making an about page is all part of it.
    <br/>
    <br/>
    if you haven't tried it out yet, you can click on :link like these;meta_about: to get more info on that thing.
    <br/>
    <br/>
    and you know, there are normal linkd |like this;twitch|
    <br/>
    <br/>
    you can find my stuff here: |twitch|, |github|, |about|
    <br/>
    <br/>
    ( ._.)
    `],
    [`meta_about`, `
    this page is running a little code to generate links for little snippets of texts. isntead of following a link when you want more info, you expand it here and there.
    <br/>
    <br/>
    the code will be exported to its own repo, but right now it's available only in this :page's;about_page: source. available on |github|
    <br/>
    <br/>
    the devleopment is :streamed;streaming: if you're intersted. i write little apps, or things to help and support me in my streaming endavor. all the on |github| of course. and all the development on |twitch|. 
    `],
    [`about_page`, `
    what you're reading right now. it's a place holder for our over ambitious plans. thankfully, out of left field, we get :this little format;meta_about: to make things more :fun: than just plain html
    <br/>
    <br/>
    there are a few things in the pipeline, but i need to get a more cohesive plan first. if i try to explain it, it'll all be gibberish. and the planning and clarification will be streamed of course :)
    <br/>
    <br/>
    if you're really curious, you should go through the |repos on github;github|. there's bound to be a clue :)
    `],
    [`streaming`, `
    so i wanted to stream. i didn't know what to stream. so i'm streaming me setting up my stream. 
    <br/>
    <br/>
    streams need more work than just streaming. we need images, place holders, concepts. we need to set up scheduel and write spiffy about sections. 
    <br/>
    <br/>
    so lets just stream that. and whatever else we happen to do along the.
    `],
    [`fun`, `
    we try to have fun here. everything else is for chumps :D
    `],
    [``, ``],
    ];
    
    const LINKS = [
      [`twitch`,`https://twitch.tv/ptsdotpng`],
      [`github`,`https://github.com/ptsdotpng`],
      [`about`,`https://ptsdotpng/github.io/index.html`],
      [``,``],
      [``,``],
    ];
    
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
    
    const main = (db, links) => {
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
    
        document.getElementById("main").innerHTML = html`
          <header>
            <div id="vid_name">
              <div class="pts" >pts</div>
              <div class="dot" >dot</div>
              <div class="png" >png</div>
            </div> 
            <h1>(hello ._.)</h1>
          </header>
          <div class="recap">
            ${get_span_ctnt(db, links, cs, db[0][1])}
          </div>
        `;
    
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
    
    main(DATA, LINKS)