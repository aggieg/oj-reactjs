import React from 'react';
import ReactDOM from 'react-dom';

import { DesignForm } from './design/designForm'
import * as design from './design/design';

import { LocalDataSource } from '../test/design/LocalDataSource';

const designDefinitions = require('../test/design/data/FruitDesigns.json');
const configuration = require('../test/design/data/MealConfiguration.json');

const dataSource: LocalDataSource = new LocalDataSource();
const designModel: design.DesignModel = new design.DesignModel(dataSource);
dataSource.addDesignDefinitions(designDefinitions);
dataSource.save("foo", configuration);

dataSource.onSave = (componentId, configuration) => {
  console.log(`* ${componentId}\n${JSON.stringify(configuration)}`);
}


const formDiv : HTMLElement | null = document.getElementById('form');
if (!formDiv) {
  throw Error("No form div")
}

ReactDOM.render(
  <DesignForm designModel={designModel} componentId="foo" 
      hideForm={()=> ReactDOM.unmountComponentAtNode(formDiv)}/>,
  formDiv
);

