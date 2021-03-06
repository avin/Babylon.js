
import * as React from "react";
import { LineContainerComponent } from '../../sharedComponents/lineContainerComponent';
import { IPropertyComponentProps } from './propertyComponentProps';
import { CheckBoxLineComponent } from '../../sharedComponents/checkBoxLineComponent';
import { FloatLineComponent } from '../../sharedComponents/floatLineComponent';
import { SliderLineComponent } from '../../sharedComponents/sliderLineComponent';
import { PropertyTypeForEdition, IPropertyDescriptionForEdition } from 'babylonjs/Materials/Node/nodeMaterialDecorator';

export class GenericPropertyComponent extends React.Component<IPropertyComponentProps> {
    constructor(props: IPropertyComponentProps) {
        super(props);
    }

    render() {
        return (
            <>
                <GeneralPropertyTabComponent globalState={this.props.globalState} guiControl={this.props.guiControl}/>
                <GenericPropertyTabComponent globalState={this.props.globalState} guiControl={this.props.guiControl}/>
            </>
        );
    }
}

export class GeneralPropertyTabComponent extends React.Component<IPropertyComponentProps> {
    constructor(props: IPropertyComponentProps) {
        super(props);
    }

    render() {
        return (
            <>
                <LineContainerComponent title="GENERAL">
                </LineContainerComponent>
            </>
        );
    }
}

export class GenericPropertyTabComponent extends React.Component<IPropertyComponentProps> {
    constructor(props: IPropertyComponentProps) {
        super(props);
    }

    forceRebuild(notifiers?: { "rebuild"?: boolean; "update"?: boolean; }) {
        if (!notifiers || notifiers.update) {
            this.props.globalState.onUpdateRequiredObservable.notifyObservers();
        }

        if (!notifiers || notifiers.rebuild) {
            this.props.globalState.onRebuildRequiredObservable.notifyObservers();
        }
    }

    render() {
        const block = this.props.guiControl,
              propStore: IPropertyDescriptionForEdition[] = (block as any)._propStore;

        if (!propStore) {
            return (
                <>
                </>
            );
        }

        const componentList: { [groupName: string]: JSX.Element[]} = {},
              groups: string[] = [];

        for (const { propertyName, displayName, type, groupName, options } of propStore) {
            let components = componentList[groupName];

            if (!components) {
                components = [];
                componentList[groupName] = components;
                groups.push(groupName);
            }

            switch (type) {
                case PropertyTypeForEdition.Boolean: {
                    components.push(
                        <CheckBoxLineComponent label={displayName} target={this.props.guiControl} propertyName={propertyName} onValueChanged={() => this.forceRebuild(options.notifiers)} />
                    );
                    break;
                }
                case PropertyTypeForEdition.Float: {
                    let cantDisplaySlider = (isNaN(options.min as number) || isNaN(options.max as number) || options.min === options.max);
                    if (cantDisplaySlider) {
                        components.push(
                            <FloatLineComponent globalState={this.props.globalState} label={displayName} propertyName={propertyName} target={this.props.guiControl} onChange={() => this.forceRebuild(options.notifiers)} />
                        );
                    } else {
                        components.push(
                            <SliderLineComponent label={displayName} target={this.props.guiControl} globalState={this.props.globalState} propertyName={propertyName} step={Math.abs((options.max as number) - (options.min as number)) / 100.0} minimum={Math.min(options.min as number, options.max as number)} maximum={options.max as number} onChange={() => this.forceRebuild(options.notifiers)}/>
                        );
                    }
                    break;
                }
            }
        }

        return (
            <>
            {
                groups.map((group) =>
                    <LineContainerComponent title={group}>
                        {componentList[group]}
                    </LineContainerComponent>
                )
            }
            </>
        );
    }
}