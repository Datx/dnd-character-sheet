import React, { Component, createRef } from 'react';
import P1 from './P1.png';
import './app.scss'
import FileSaver from 'file-saver';
import playersHandbook from './players_handbook.pdf';
import Spinner from './components/spinner';

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


import axios from "axios";

library.add(fas) //FONT AWESOME




const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/",
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jsonData: {},
      loadingView: true,
      safeLock: false,
      showBottomMenu: true,
    };
  }
  
  firstPage = createRef();
  secondPage = createRef();
  thirdPage = createRef();

  componentDidMount =  () => {    
    this.getCharacterData();

    //Disable scroll behaviour on number inputs (such as stats)
    document.addEventListener("wheel", function(event){
      if(document.activeElement.type === "number"){
          document.activeElement.blur();
      }
    });
  }

  componentDidUpdate = () => {
  }

  getCharacterData = async () => {
    axiosInstance.get('/datos')
      .then((response) => {
        // console.log("GET /data",response.data);
        this.setState({ jsonData: JSON.parse(response.data), loadingView: false});
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(function () {
      });
  }

  saveCharacterData = async (string) => {
    const params = {
      string: string
      // string: ""
    }
    axiosInstance.put('/datos', params, { mode: 'no-cors'})
      .then((response) => {
        // console.log("PUT /data",response.data);
      })
      .catch((error) => {
        console.log(error);
        this.setState({ loadingView: true});
      })
      .finally(function () {
      });
  }

  handleOnChangeSheet = (event) => {
    const {name, value, checked} = event.target;
    if(!this.loadingView){
      if(!this.state.safeLock || ["hit_points_current", "inspiration", "temp_hit_points", "equipment_text", "spell_level_one_slots_expended", "hit_dice"].includes(name)){
        let newJsonData = {};
        if(event.target.type == "radio") {
          newJsonData = {...this.state.jsonData, [name]: this.state.jsonData[name] ? undefined : true};
        }
        else{
          newJsonData = {...this.state.jsonData, [name]: value};
        }
        this.setState({ jsonData: newJsonData })    
        let data = JSON.stringify(newJsonData);
        this.saveCharacterData(data);    
      }    
    }
  }

  handleDownloadCharacterJson = () => {  
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(this.state.jsonData, null, 2)], {
      type: "text/plain"
    }));
    a.setAttribute("download", "character-sheet.json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  handleOpenPlayersHandbook = () => {
    window.open(playersHandbook, '_blank');
  }
  

  // handleDownloadCharacterJson(){
  //   fs.writeFile("character-sheet.json", this.state.jsonData, function(err) {
  //     if (err) {
  //         console.log(err);
  //     }
  // });
  // }

  addPlusSignToNumber = (number) => {
    if(number >= 0 && number != " " && number != "" && number != undefined && !((typeof number == "string") && number.includes("+"))) {
      return "+" + number;
    }
    return number;
  }

  calcModifier = (stat, proficiencyCheck = null) => {
    let modifier = ((stat == undefined) || stat=="") ? " " : Math.floor((stat - 10) / 2);
    // console.log(modifier, proficiencyCheck, this.state.jsonData[proficiencyCheck])
    if((this.state.jsonData.proficiency_bonus != undefined) && this.state.jsonData[proficiencyCheck]){
      let proficiencyBonus = parseInt(this.state.jsonData.proficiency_bonus);
      // console.log("proficiencyBonus: ", proficiencyBonus)
      if(proficiencyBonus){
        modifier += proficiencyBonus;
      }
    }
    modifier= this.addPlusSignToNumber(modifier)
    return modifier;
  }

  handleSafetyLockData = () => {
    // this.setState({ safeLock: !this.state.safeLock });
  }

  handleOpenSpellsPage = () => {
    window.open("https://dndspellslist.com/spells", '_blank');
  }

  handleFocusFirstPage = () => {
    this.firstPage.current.scrollIntoView();  
  }
  handleFocusSecondPage = () => {
    this.secondPage.current.scrollIntoView();  
  }
  handleFocusThirdPage = () => {
    this.thirdPage.current.scrollIntoView();   
  }
  

  handleHideBottomMenu = () => {
    this.setState({showBottomMenu: !this.state.showBottomMenu})
  }


  render () {
    // console.log(this.state)
    // let loadingView = this.state.loadingView;
    // let loadingView = true
    return(
      <div className="app">
        {this.state.loadingView && (<div className="full_screen_glass_loading"><Spinner/></div>)}
        <div className="p1_wrapper" ref={this.firstPage}>        
          {/* <img src={P1}></img>  */}
          <img src="https://i.imgur.com/ObSEiLf.png"></img>
        </div>
        <div className="p2_wrapper" ref={this.secondPage}>        
          {/* <img src={P1}></img>  */}
          {/* <img src="https://iili.io/JvEz40N.png"></img> */}
          <img src="https://imgur.com/5OTTqaB.png"></img>
        </div>
        <div className="p3_wrapper" ref={this.thirdPage}>
          <img src="https://imgur.com/kiGcdG7.png"></img> 
        </div>
        <div className="actions_wrapper">
          {/* <FontAwesomeIcon onClick={this.handleSafetyLockData} icon={"fas "+ (this.state.safeLock ? "fa-lock" : "fa-lock-open")} className={'lock_action' + (this.state.safeLock ? "" : " inactive")}/> */}
          <FontAwesomeIcon onClick={this.handleDownloadCharacterJson} icon={"fas fa-download"}/>
          <FontAwesomeIcon onClick={this.handleOpenPlayersHandbook} icon={"fas fa-book"}/>   
          <FontAwesomeIcon onClick={this.handleOpenSpellsPage} icon={"fa-solid fa-wand-sparkles"}/>       
        </div>
        <div className="character_wrapper">
          <div className="character_top_title_data">
            <input type="text" name="character_name" className='character_name' value={this.state.jsonData.character_name} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="class_and_level" className='class_and_level' value={this.state.jsonData.class_and_level} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="background" className='background' value={this.state.jsonData.background} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="player_name" className='player_name' value={this.state.jsonData.player_name} onChange={this.handleOnChangeSheet}/>        
            <input type="text" name="race" className='race' value={this.state.jsonData.race} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="alignment" className='alignment' value={this.state.jsonData.alignment} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="experience_points" className='experience_points' value={this.state.jsonData.experience_points} onChange={this.handleOnChangeSheet}/> 
          </div>
          <div className="character_stats">
            <input type="number" name="stats_str" className='stats_str' value={this.state.jsonData.stats_str} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="stats_str_modifier" className='stats_str_modifier stat_modifier' value={this.calcModifier(this.state.jsonData.stats_str)} onChange={this.handleOnChangeSheet}/>
            <input type="number" name="stats_dex" className='stats_dex' value={this.state.jsonData.stats_dex} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="stats_dex_modifier" className='stats_dex_modifier stat_modifier' value={this.calcModifier(this.state.jsonData.stats_dex)} onChange={this.handleOnChangeSheet}/>
            <input type="number" name="stats_con" className='stats_con' value={this.state.jsonData.stats_con} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="stats_con_modifier" className='stats_con_modifier stat_modifier' value={this.calcModifier(this.state.jsonData.stats_con)} onChange={this.handleOnChangeSheet}/>
            <input type="number" name="stats_int" className='stats_int' value={this.state.jsonData.stats_int} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="stats_int_modifier" className='stats_int_modifier stat_modifier' value={this.calcModifier(this.state.jsonData.stats_int)} onChange={this.handleOnChangeSheet}/>
            <input type="number" name="stats_wis" className='stats_wis' value={this.state.jsonData.stats_wis} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="stats_wis_modifier" className='stats_wis_modifier stat_modifier' value={this.calcModifier(this.state.jsonData.stats_wis)} onChange={this.handleOnChangeSheet}/>
            <input type="number" name="stats_cha" className='stats_cha' value={this.state.jsonData.stats_cha} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="stats_cha_modifier" className='stats_cha_modifier stat_modifier' value={this.calcModifier(this.state.jsonData.stats_cha)} onChange={this.handleOnChangeSheet}/>
          </div>
          <div className="inspiration_container">
            <input type="number" name="inspiration" className='inspiration' value={this.state.jsonData.inspiration} onChange={this.handleOnChangeSheet}/>
          </div>
          <div className="proficiency_bonus_container">
            <input type="text" name="proficiency_bonus" className='proficiency_bonus' value={this.addPlusSignToNumber(this.state.jsonData.proficiency_bonus)} onChange={this.handleOnChangeSheet}/>
          </div>
          <div className="saving_throws">
            <form className="saving_throws_proficiencies">
              <fieldset>
                <input type="radio" name="saving_throws_str" className='saving_throws_str' value={this.state.jsonData.saving_throws_str} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.saving_throws_str} disabled={this.state.safeLock}/>
                <input type="radio" name="saving_throws_dex" className='saving_throws_dex' value={this.state.jsonData.saving_throws_dex} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.saving_throws_dex} disabled={this.state.safeLock}/>
                <input type="radio" name="saving_throws_con" className='saving_throws_con' value={this.state.jsonData.saving_throws_con} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.saving_throws_con} disabled={this.state.safeLock}/>
                <input type="radio" name="saving_throws_int" className='saving_throws_int' value={this.state.jsonData.saving_throws_int} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.saving_throws_int} disabled={this.state.safeLock}/>
                <input type="radio" name="saving_throws_wis" className='saving_throws_wis' value={this.state.jsonData.saving_throws_wis} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.saving_throws_wis} disabled={this.state.safeLock}/>
                <input type="radio" name="saving_throws_cha" className='saving_throws_cha' value={this.state.jsonData.saving_throws_cha} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.saving_throws_cha} disabled={this.state.safeLock}/>
              </fieldset>
            </form>
            <div className="saving_throws_modifiers">
              <input type="text" name="saving_throws_str_modifier" className='saving_throws_str_modifier' value={this.calcModifier(this.state.jsonData.stats_str, "saving_throws_str")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.saving_throws_str ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="saving_throws_dex_modifier" className='saving_throws_dex_modifier' value={this.calcModifier(this.state.jsonData.stats_dex, "saving_throws_dex")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.saving_throws_dex ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="saving_throws_con_modifier" className='saving_throws_con_modifier' value={this.calcModifier(this.state.jsonData.stats_con, "saving_throws_con")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.saving_throws_con ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="saving_throws_int_modifier" className='saving_throws_int_modifier' value={this.calcModifier(this.state.jsonData.stats_int, "saving_throws_int")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.saving_throws_int ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="saving_throws_wis_modifier" className='saving_throws_wis_modifier' value={this.calcModifier(this.state.jsonData.stats_wis, "saving_throws_wis")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.saving_throws_wis ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="saving_throws_cha_modifier" className='saving_throws_cha_modifier' value={this.calcModifier(this.state.jsonData.stats_cha, "saving_throws_cha")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.saving_throws_cha ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
            </div>
          </div>
          <div className="skills">
            <form className="skills_proficiencies">
              <fieldset>
                <input type="radio" name="skills_acrobatics" className='skills_acrobatics' value={this.state.jsonData.skills_acrobatics} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_acrobatics} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_animal_handling" className='skills_animal_handling' value={this.state.jsonData.skills_animal_handling} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_animal_handling} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_arcana" className='skills_arcana' value={this.state.jsonData.skills_arcana} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_arcana} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_athletics" className='skills_athletics' value={this.state.jsonData.skills_athletics} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_athletics} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_deception" className='skills_deception' value={this.state.jsonData.skills_deception} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_deception} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_history" className='skills_history' value={this.state.jsonData.skills_history} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_history} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_insight" className='skills_insight' value={this.state.jsonData.skills_insight} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_insight} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_intimidation" className='skills_intimidation' value={this.state.jsonData.skills_intimidation} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_intimidation} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_investigation" className='skills_investigation' value={this.state.jsonData.skills_investigation} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_investigation} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_medicine" className='skills_medicine' value={this.state.jsonData.skills_medicine} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_medicine} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_nature" className='skills_nature' value={this.state.jsonData.skills_nature} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_nature} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_perception" className='skills_perception' value={this.state.jsonData.skills_perception} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_perception} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_performance" className='skills_performance' value={this.state.jsonData.skills_performance} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_performance} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_persuasion" className='skills_persuasion' value={this.state.jsonData.skills_persuasion} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_persuasion} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_religion" className='skills_religion' value={this.state.jsonData.skills_religion} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_religion} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_sleight_of_hand" className='skills_sleight_of_hand' value={this.state.jsonData.skills_sleight_of_hand} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_sleight_of_hand} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_stealth" className='skills_stealth' value={this.state.jsonData.skills_stealth} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_stealth} disabled={this.state.safeLock}/>
                <input type="radio" name="skills_survival" className='skills_survival' value={this.state.jsonData.skills_survival} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.skills_survival} disabled={this.state.safeLock}/>
              </fieldset>
            </form>
            <div className="skills_modifiers">
              <input type="text" name="skills_acrobatics_modifier" className='skills_acrobatics_modifier' value={this.calcModifier(this.state.jsonData.stats_dex, "skills_acrobatics")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_acrobatics ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_animal_handling_modifier" className='skills_animal_handling_modifier' value={this.calcModifier(this.state.jsonData.stats_wis, "skills_animal_handling")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_animal_handling ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_arcana_modifier" className='skills_arcana_modifier' value={this.calcModifier(this.state.jsonData.stats_int, "skills_arcana")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_arcana ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_athletics_modifier" className='skills_athletics_modifier' value={this.calcModifier(this.state.jsonData.stats_str, "skills_athletics")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_athletics ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_deception_modifier" className='skills_deception_modifier' value={this.calcModifier(this.state.jsonData.stats_cha, "skills_deception")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_deception ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_history_modifier" className='skills_history_modifier' value={this.calcModifier(this.state.jsonData.stats_int, "skills_history")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_history ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_insight_modifier" className='skills_insight_modifier' value={this.calcModifier(this.state.jsonData.stats_wis, "skills_insight")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_insight ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_intimidation_modifier" className='skills_intimidation_modifier' value={this.calcModifier(this.state.jsonData.stats_cha, "skills_intimidation")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_intimidation ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_investigation_modifier" className='skills_investigation_modifier' value={this.calcModifier(this.state.jsonData.stats_int, "skills_investigation")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_investigation ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_medicine_modifier" className='skills_medicine_modifier' value={this.calcModifier(this.state.jsonData.stats_wis, "skills_medicine")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_medicine ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_nature_modifier" className='skills_nature_modifier' value={this.calcModifier(this.state.jsonData.stats_int, "skills_nature")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_nature ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_perception_modifier" className='skills_perception_modifier' value={this.calcModifier(this.state.jsonData.stats_wis, "skills_perception")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_perception ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_performance_modifier" className='skills_performance_modifier' value={this.calcModifier(this.state.jsonData.stats_cha, "skills_performance")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_performance ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_persuasion_modifier" className='skills_persuasion_modifier' value={this.calcModifier(this.state.jsonData.stats_cha, "skills_persuasion")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_persuasion ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_religion_modifier" className='skills_religion_modifier' value={this.calcModifier(this.state.jsonData.stats_int, "skills_religion")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_religion ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_sleight_of_hand_modifier" className='skills_sleight_of_hand_modifier' value={this.calcModifier(this.state.jsonData.stats_dex, "skills_sleight_of_hand")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_sleight_of_hand ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_stealth_modifier" className='skills_stealth_modifier' value={this.calcModifier(this.state.jsonData.stats_dex, "skills_stealth")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_stealth ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
              <input type="text" name="skills_survival_modifier" className='skills_survival_modifier' value={this.calcModifier(this.state.jsonData.stats_wis, "skills_survival")} onChange={this.handleOnChangeSheet} style={this.state.jsonData.skills_survival ? {fontWeight: "bold", color: "#c4ff81"} : {}}/>
            </div>
          </div>
          <div className="combat_stats">
            <input type="number" name="armor_class" className='armor_class' value={this.state.jsonData.armor_class} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="initiative" className='initiative' value={this.addPlusSignToNumber(this.state.jsonData.initiative)} onChange={this.handleOnChangeSheet}/>
            <input type="number" name="speed" className='speed' value={this.state.jsonData.speed} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="hit_points_max" className='hit_points_max' value={this.state.jsonData.hit_points_max} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="hit_points_current" className='hit_points_current' value={this.state.jsonData.hit_points_current} onChange={this.handleOnChangeSheet} style={this.state.jsonData.hit_points_current < 3 ? {color: "red"} : {}}/>
            <input type="text" name="temp_hit_points" className='temp_hit_points' value={this.state.jsonData.temp_hit_points} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="hit_dice_total" className='hit_dice_total' value={this.state.jsonData.hit_dice_total} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="hit_dice" className='hit_dice' value={this.state.jsonData.hit_dice} onChange={this.handleOnChangeSheet}/> 
          </div>
          <form className="death_saving_throws">
            <fieldset>
              <input type="radio" name="death_saving_throws_success_1" className='death_saving_throws_success_1' value={this.state.jsonData.death_saving_throws_success_1} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.death_saving_throws_success_1}/>
              <input type="radio" name="death_saving_throws_success_2" className='death_saving_throws_success_2' value={this.state.jsonData.death_saving_throws_success_2} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.death_saving_throws_success_2}/>
              <input type="radio" name="death_saving_throws_success_3" className='death_saving_throws_success_3' value={this.state.jsonData.death_saving_throws_success_3} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.death_saving_throws_success_3}/>
              <input type="radio" name="death_saving_throws_failure_1" className='death_saving_throws_failure_1' value={this.state.jsonData.death_saving_throws_failure_1} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.death_saving_throws_failure_1}/>
              <input type="radio" name="death_saving_throws_failure_2" className='death_saving_throws_failure_2' value={this.state.jsonData.death_saving_throws_failure_2} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.death_saving_throws_failure_2}/>
              <input type="radio" name="death_saving_throws_failure_3" className='death_saving_throws_failure_3' value={this.state.jsonData.death_saving_throws_failure_3} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.death_saving_throws_failure_3}/>
            </fieldset>
          </form>
          <div className="attacks_and_spellcasting">
            <input type="text" name="weapon_1_name" className='weapon_1_name' value={this.state.jsonData.weapon_1_name} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="weapon_1_attack_bonus" className='weapon_1_attack_bonus' value={this.state.jsonData.weapon_1_attack_bonus} onChange={this.handleOnChangeSheet}/> 
            <input type="text" name="weapon_1_damage" className='weapon_1_damage' value={this.state.jsonData.weapon_1_damage} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="weapon_2_name" className='weapon_2_name' value={this.state.jsonData.weapon_2_name} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="weapon_2_attack_bonus" className='weapon_2_attack_bonus' value={this.state.jsonData.weapon_2_attack_bonus} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="weapon_2_damage" className='weapon_2_damage' value={this.state.jsonData.weapon_2_damage} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="weapon_3_name" className='weapon_3_name' value={this.state.jsonData.weapon_3_name} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="weapon_3_attack_bonus" className='weapon_3_attack_bonus' value={this.state.jsonData.weapon_3_attack_bonus} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="weapon_3_damage" className='weapon_3_damage' value={this.state.jsonData.weapon_3_damage} onChange={this.handleOnChangeSheet}/>
            <textarea type="text" name="spellcasting_text" className='spellcasting_text' value={this.state.jsonData.spellcasting_text} onChange={this.handleOnChangeSheet}/>
          </div>  
          <div className="equipment">
            <textarea type="text" name="equipment_text" className='equipment_text' value={this.state.jsonData.equipment_text} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="copper_points" className='copper_points' value={this.state.jsonData.copper_points} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="silver_points" className='silver_points' value={this.state.jsonData.silver_points} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="electrum_points" className='electrum_points' value={this.state.jsonData.electrum_points} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="gold_points" className='gold_points' value={this.state.jsonData.gold_points} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="platinum_points" className='platinum_points' value={this.state.jsonData.platinum_points} onChange={this.handleOnChangeSheet}/>
          </div>
          <div className="passive_wisdom_container">
            <input type="text" name="passive_wisdom" className='passive_wisdom' value={this.state.jsonData.passive_wisdom} onChange={this.handleOnChangeSheet}/>
          </div>
          <div className="other_proficiencies_and_languages_container">
            <textarea type="text" name="other_proficiencies_and_languages_text" className='other_proficiencies_and_languages_text' value={this.state.jsonData.other_proficiencies_and_languages_text} onChange={this.handleOnChangeSheet}/>
          </div>
          <div className="character_traits">
            <textarea type="text" name="personality_traits" className='personality_traits' value={this.state.jsonData.personality_traits} onChange={this.handleOnChangeSheet}/>
            <textarea type="text" name="ideals" className='ideals' value={this.state.jsonData.ideals} onChange={this.handleOnChangeSheet}/>
            <textarea type="text" name="bonds" className='bonds' value={this.state.jsonData.bonds} onChange={this.handleOnChangeSheet}/>
            <textarea type="text" name="flaws" className='flaws' value={this.state.jsonData.flaws} onChange={this.handleOnChangeSheet}/>
            <textarea type="features_and_traits" name="features_and_traits" className='features_and_traits' value={this.state.jsonData.features_and_traits} onChange={this.handleOnChangeSheet}/>
          </div>
        </div>
        <div className="character_spells">
          <div className="spells_top_data">
            <input type="text" name="spellcasting_class" className='spellcasting_class' value={this.state.jsonData.spellcasting_class} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="spellcasting_ability" className='spellcasting_ability' value={this.state.jsonData.spellcasting_ability} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="spell_save_dc" className='spell_save_dc' value={this.state.jsonData.spell_save_dc} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="spell_attack_bonus" className='spell_attack_bonus' value={this.state.jsonData.spell_attack_bonus} onChange={this.handleOnChangeSheet}/>
          </div>
          <div className="cantrips">
            <input type="text" name="cantrip_1" className='cantrip cantrip_1' value={this.state.jsonData.cantrip_1} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="cantrip_2" className='cantrip cantrip_2' value={this.state.jsonData.cantrip_2} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="cantrip_3" className='cantrip cantrip_3' value={this.state.jsonData.cantrip_3} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="cantrip_4" className='cantrip cantrip_4' value={this.state.jsonData.cantrip_4} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="cantrip_5" className='cantrip cantrip_5' value={this.state.jsonData.cantrip_5} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="cantrip_6" className='cantrip cantrip_6' value={this.state.jsonData.cantrip_6} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="cantrip_7" className='cantrip cantrip_7' value={this.state.jsonData.cantrip_7} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="cantrip_8" className='cantrip cantrip_8' value={this.state.jsonData.cantrip_8} onChange={this.handleOnChangeSheet}/>
          </div>
          <div className="spells_level_one_prepared">
            <input type="radio" name="spell_level_one_spell_1_prepared" className='spell_prepared spell_level_one_prepared spell_level_one_spell_1_prepared' value={this.state.jsonData.spell_level_one_spell_1_prepared} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.spell_level_one_spell_1_prepared} disabled={this.state.safeLock}/>
            <input type="radio" name="spell_level_one_spell_2_prepared" className='spell_prepared spell_level_one_prepared spell_level_one_spell_2_prepared' value={this.state.jsonData.spell_level_one_spell_2_prepared} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.spell_level_one_spell_2_prepared} disabled={this.state.safeLock}/>
            <input type="radio" name="spell_level_one_spell_3_prepared" className='spell_prepared spell_level_one_prepared spell_level_one_spell_3_prepared' value={this.state.jsonData.spell_level_one_spell_3_prepared} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.spell_level_one_spell_3_prepared} disabled={this.state.safeLock}/>
            <input type="radio" name="spell_level_one_spell_4_prepared" className='spell_prepared spell_level_one_prepared spell_level_one_spell_4_prepared' value={this.state.jsonData.spell_level_one_spell_4_prepared} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.spell_level_one_spell_4_prepared} disabled={this.state.safeLock}/>
            <input type="radio" name="spell_level_one_spell_5_prepared" className='spell_prepared spell_level_one_prepared spell_level_one_spell_5_prepared' value={this.state.jsonData.spell_level_one_spell_5_prepared} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.spell_level_one_spell_5_prepared} disabled={this.state.safeLock}/>
            <input type="radio" name="spell_level_one_spell_6_prepared" className='spell_prepared spell_level_one_prepared spell_level_one_spell_6_prepared' value={this.state.jsonData.spell_level_one_spell_6_prepared} onClick={this.handleOnChangeSheet} checked={this.state.jsonData.spell_level_one_spell_6_prepared} disabled={this.state.safeLock}/>
          </div>
          <div className="spells_level_one">
            <input type="text" name="spell_level_one_slots_total" className='spell_level_one_slots_total' value={this.state.jsonData.spell_level_one_slots_total} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="spell_level_one_slots_expended" className='spell_level_one_slots_expended' value={this.state.jsonData.spell_level_one_slots_expended} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="spell_level_one_spell_1" className='spell_level_one spell_level_one_spell_1' value={this.state.jsonData.spell_level_one_spell_1} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="spell_level_one_spell_2" className='spell_level_one spell_level_one_spell_2' value={this.state.jsonData.spell_level_one_spell_2} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="spell_level_one_spell_3" className='spell_level_one spell_level_one_spell_3' value={this.state.jsonData.spell_level_one_spell_3} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="spell_level_one_spell_4" className='spell_level_one spell_level_one_spell_4' value={this.state.jsonData.spell_level_one_spell_4} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="spell_level_one_spell_5" className='spell_level_one spell_level_one_spell_5' value={this.state.jsonData.spell_level_one_spell_5} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="spell_level_one_spell_6" className='spell_level_one spell_level_one_spell_6' value={this.state.jsonData.spell_level_one_spell_6} onChange={this.handleOnChangeSheet}/>
          </div>
          <div className="spells_bottom_notes_wrapper">
            <textarea type="text" name="spells_bottom_notes" className='spells_bottom_notes' value={this.state.jsonData.spells_bottom_notes} onChange={this.handleOnChangeSheet}/>
          </div>
        </div>
        <div className="character_data">
          <div className="character_top_data">
            <input type="text" name="character_name" className='character_name' value={this.state.jsonData.character_name} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="age" className='age' value={this.state.jsonData.age} onChange={this.handleOnChangeSheet}/>    
            <input type="text" name="height" className='height' value={this.state.jsonData.height} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="weight" className='weight' value={this.state.jsonData.weight} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="eyes" className='eyes' value={this.state.jsonData.eyes} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="skin" className='skin' value={this.state.jsonData.skin} onChange={this.handleOnChangeSheet}/>
            <input type="text" name="hair" className='hair' value={this.state.jsonData.hair} onChange={this.handleOnChangeSheet}/>
          </div>
          <div className="character_data_areas_wrapper">
            <input type="text" name="symbol_name" className='symbol_name' value={this.state.jsonData.symbol_name} onChange={this.handleOnChangeSheet}/>
            <textarea type="text" name="character_appearance" className='character_appearance' value={this.state.jsonData.character_appearance} onChange={this.handleOnChangeSheet}/>
            <textarea type="text" name="character_backstory" className='character_backstory' value={this.state.jsonData.character_backstory} onChange={this.handleOnChangeSheet}/>
            <textarea type="text" name="allies_and_organizations" className='allies_and_organizations' value={this.state.jsonData.allies_and_organizations} onChange={this.handleOnChangeSheet}/>
            <textarea type="text" name="additional_features_and_traits" className='additional_features_and_traits' value={this.state.jsonData.additional_features_and_traits} onChange={this.handleOnChangeSheet}/>
            <textarea type="text" name="treasure" className='treasure' value={this.state.jsonData.treasure} onChange={this.handleOnChangeSheet}/>
          </div>
          <div className="character_data_bottom_notes_wrapper">
            <textarea type="text" name="character_data_bottom_notes" className='character_data_bottom_notes' value={this.state.jsonData.character_data_bottom_notes} onChange={this.handleOnChangeSheet}/>
          </div>
        </div>
        <div className={"bottom_menu_wrapper" + (this.state.showBottomMenu ? "" : " hidden_menu")}>
          <div className="bottom_menu_actions">
            <div className="left_bottom_actions">
              <FontAwesomeIcon icon="fa-solid fa-id-card-clip" onClick={this.handleFocusFirstPage} title={"Centrar página de personaje"}/>
              <FontAwesomeIcon icon="fa-solid fa-hat-wizard" onClick={this.handleFocusSecondPage} title={"Centrar hechizos"}/>
              <FontAwesomeIcon icon="fa-solid fa-newspaper" onClick={this.handleFocusThirdPage}/>
            </div>
            <FontAwesomeIcon icon="fa-solid fa-chevron-down" className='hide_bottom_menu_arrow' onClick={this.handleHideBottomMenu}/>
            <div className="right_bottom_actions">
              <FontAwesomeIcon onClick={this.handleOpenPlayersHandbook} icon={"fas fa-book"} title={"Abrir libro 5e (Players Handbook)"}/>   
              <FontAwesomeIcon onClick={this.handleOpenSpellsPage} icon={"fa-solid fa-wand-sparkles"} title={"Abrir web de hechizos"}/> 
              {/* <FontAwesomeIcon onClick={this.handleSafetyLockData} icon={"fas "+ (this.state.safeLock ? "fa-lock" : "fa-lock-open")} className={'lock_action' + (this.state.safeLock ? "" : " inactive")} title={"Alternar modo seguro"}/> */}
            </div>
          </div>
        </div>
      </div>
    );
  };
};

export default App;