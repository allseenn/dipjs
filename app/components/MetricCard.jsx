import React from 'react';

const MetricCard = ({ title, value, unit }) => {
    return (
        <div className="card text-center">
            <div className="card-body">
                <h5 className="card-title">{title}</h5>
                <p className="card-text display-5">{value ?? '--'}</p>
                <p className="text-muted">{unit}</p>
            </div>
        </div>
    );
};

export default MetricCard;
