import PropTypes from 'prop-types';
import React from 'react';
import hash from 'object-hash';
import _ from 'lodash';
import d3 from 'd3';
import {prettyEnglishProficiencyText} from '../helpers/language';
import Bar from '../components/Bar';
import SectionHeading from '../components/SectionHeading';


// Experimental
export default class Quilts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortKey: 'gender',
      stableSorting: false
    };
  }

  render() {
    const {sortKey, stableSorting} = this.state;
    const {students} = this.props;
    const intersections = students.map(intersectionFor);
    const allIntersections = _.sortBy(_.uniqWith(intersections, _.isEqual), hash);
    const sortedStudents = (!stableSorting)
      ? (sortKey) ? _.sortBy(students, sortKey) : students
      : _.sortBy(students, student => {
        const intersection = intersectionFor(student);
        const key = intersectionKeyFor(intersection);
        return [key, student.id];
      });

    const color = d3.scale.ordinal()
      .domain(allIntersections.map(JSON.stringify))
      .range(['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02','#a6761d','#666666']);
    return (
      <div className="Quilts" style={{margin: 10}}>
        <SectionHeading>Category breakdowns</SectionHeading>
        <div style={{margin: 10}}>
          {this.renderButton('gender')}
          {this.renderButton('hispanic_latino')}
          {this.renderButton('race')}
          {this.renderButton('home_language')}
          {this.renderButton('limited_english_proficiency')}
          {this.renderButton('disability')}
          {this.renderButton(null, { text: 'across all'})}
          <button
            style={{background: 'white', border: 'none', cursor: 'pointer', fontWeight: stableSorting ? 'bold' : 'normal'}}
            onClick={e => this.setState({stableSorting: this.state.stableSorting})}>stable sorting</button>
        </div>
        {sortedStudents.map(student => {
          const intersection = intersectionFor(student);
          const intersectionKey = intersectionKeyFor(intersection);
          return (
            <div
              key={student.id}
              title={JSON.stringify({id: student.id, intersectionKey, intersection}, null, 2)}
              style={{
                width: 32,
                height: 32,
                display: 'inline-block',
                padding: 5,
                cursor: 'pointer',
                fontSize: 8,
                backgroundColor: (sortKey)
                  ? color(student[sortKey])
                  : color(JSON.stringify(intersection))
              }}>
              <div>{intersectionKey}</div>
            </div>
          );
        })}
        {this.renderSummary(students, allIntersections)}
      </div>
    );
  }

  renderButton(key, options = {}) {
    const {sortKey} = this.state;
    return (
      <button
        style={{
          background: (sortKey === key)? 'lightblue' : 'white',
          border: '1px solid #ccc',
          padding: 5,
          cursor: 'pointer'
        }}
        onClick={e => this.setState({sortKey: key})}>{options.text || key}</button>
    );
  }

  renderSummary(students, allIntersections) {
    const groupIntersections = students.reduce((map, student) => {
      const intersection = intersectionFor(student);
      const intersectionKey = intersectionKeyFor(intersection);
      return {
        ...map,
        [intersectionKey]: intersection
      };
    }, {});

    const groups = _.groupBy(students, student => {
      const intersection = intersectionFor(student);
      const intersectionKey = intersectionKeyFor(intersection);
      return intersectionKey;
    });

    const intersectionKeysBySize = _.sortBy(Object.keys(groups), intersectionKey => -1 * groups[intersectionKey].length);

    const countOfStudentsInGroupOfOne = Object.keys(groups).filter(intersectionKey => groups[intersectionKey].length === 1).length;

    return (
      <div style={{marginTop: 20}}>
        <SectionHeading>Groups</SectionHeading>
        <div style={{margin: 10}}>Students in their own group: {countOfStudentsInGroupOfOne}</div>
        <div>
          {intersectionKeysBySize.map(intersectionKey => {
            const intersection = groupIntersections[intersectionKey];
            return (
              <div key={intersectionKey} title={JSON.stringify(intersection)} style={{display: 'flex', flexDirection: 'row'}}>
                <div style={{width: 80}}>{intersectionKey}</div>
                <div style={{width: 120}}>{groups[intersectionKey].length} students</div>
                <div style={{width: 300}}>
                  <Bar
                    style={{background: '#333', color: 'white', fontSize: 8}}
                    threshold={1}
                    percent={100 * groups[intersectionKey].length / students.length}
                  />
                </div>
                <div style={{fontSize: 8, flex: 1, overflowX: 'hidden'}}>{JSON.stringify(intersection)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
Quilts.propTypes = {
  students: PropTypes.arrayOf(PropTypes.shape({
    race: PropTypes.string,
    disability: PropTypes.string,
    limited_english_proficiency: PropTypes.string,
    gender: PropTypes.string,
    grade: PropTypes.string,
    free_reduced_lunch: PropTypes.string,
    hispanic_latino: PropTypes.bool,
    homeroom_id: PropTypes.number,
    homeroom_name: PropTypes.string
  })).isRequired
};


function intersectionFor(student) {
  return {
    race: student.race || 'Unknown',
    isHispanic: student.hispanic_latino,
    gender: student.gender,
    disability: student.disability || 'None',
    englishProficiency: prettyEnglishProficiencyText('somerville', student.limited_english_proficiency),
    isLowIncome: isLowIncome(student),
    homeLanguage: student.home_language || 'Unknown'
  };
}

function intersectionKeyFor(intersection) {
  return parseInt(hash(intersection), 16) % 255;
}

function isLowIncome(student) {
  return ['Free Lunch', 'Reduced Lunch'].indexOf(student.free_reduced_lunch) !== -1;
}
