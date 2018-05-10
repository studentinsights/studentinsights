import React from 'react';
import Timestamp from '../components/Timestamp';
import School from '../components/School';
import Educator from '../components/Educator';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import {gradeText} from '../helpers/gradeText';
import {bucketInto} from '../helpers/bucketInto';
import {fetchAllClassListsJson} from './api';


// Show users their class lists.  More useful for principals, building admin,
// or ELL/SPED teachers than classroom teachers (who are typically
// making a single list).
export default class ClassListsViewPage extends React.Component {
  constructor(props) {
    super(props);

    this.renderPage = this.renderPage.bind(this);
  }

  render() {
    return (
      <div className="ClassListsViewPage">
        <SectionHeading>Class lists</SectionHeading>
        <GenericLoader
          promiseFn={fetchAllClassListsJson}
          render={this.renderPage} />
      </div>
    );
  }

  renderPage(json) {
    const classLists = json.class_lists;

    if (classLists.length === 0) return <div>None!</div>;

    return (
      <table>
        <thead>
          <tr>
            <th>School</th>
            <th>Grade next year</th>
            <th>Owner</th>
            <th>Created on</th>
            <th>Session</th>
            <th>{'\u00A0'}</th>
          </tr>
        </thead>
        <tbody>{classLists.map(classList => {
          const shorthand = bucketInto(classList.workspace_id, SHORTHANDS);
          return (
            <tr key={classList.id}>
              <td><School {...classList.school} /></td>
              <td>{gradeText(classList.grade_level_next_year)}</td>
              <td><Educator educator={classList.created_by_educator} /></td>
              <td><Timestamp railsTimestamp={classList.created_at} /></td>
              <td><a href={`/classlists/${classList.id}`}>view {classList.workspace_id.slice(0, 4).toUpperCase()}...</a></td>
            </tr>
          );
        })}</tbody>
      </table>
    );
  }
}

const SHORTHANDS = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];

const styles = {
  
};
